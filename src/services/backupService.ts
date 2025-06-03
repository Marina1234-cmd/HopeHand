import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { logSystemAction } from './activityLogger'
import { compress } from 'gzip-js'
import { UserRole } from '../types/auth'

// Initialize Firebase Admin

const db = getFirestore()
const bucket = getStorage().bucket()

interface BackupConfig {
  collections: string[]
  backupPath: string
  retentionDays: number
  schedule: {
    frequency: 'hourly' | 'daily' | 'weekly'
    hour?: number
    dayOfWeek?: number
  }
}

interface SystemUser {
  id: string
  name: string
  role: UserRole
}

const systemUser: SystemUser = {
  id: 'backup-service',
  name: 'Backup Service',
  role: 'admin'
}

const backupConfigs: BackupConfig[] = [
  {
    collections: ['users', 'campaigns', 'donations'],
    backupPath: 'backups/core',
    retentionDays: 30,
    schedule: {
      frequency: 'daily',
      hour: 1 // 1 AM
    }
  },
  {
    collections: ['activityLogs', 'rateLimits'],
    backupPath: 'backups/security',
    retentionDays: 90,
    schedule: {
      frequency: 'weekly',
      hour: 2, // 2 AM
      dayOfWeek: 0 // Sunday
    }
  },
  {
    collections: ['comments', 'testimonials'],
    backupPath: 'backups/engagement',
    retentionDays: 14,
    schedule: {
      frequency: 'daily',
      hour: 3 // 3 AM
    }
  }
]

export const performBackup = async (config: BackupConfig): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupData: { [collection: string]: Record<string, unknown>[] } = {}

  try {
    // Backup each collection
    for (const collectionName of config.collections) {
      const snapshot = await db.collection(collectionName).get()
      backupData[collectionName] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }

    // Compress the backup data
    const compressedData = compress(JSON.stringify(backupData))
    const backupFileName = `${config.backupPath}/${timestamp}.json.gz`

    // Upload to Firebase Storage
    const file = bucket.file(backupFileName)
    await file.save(Buffer.from(compressedData), {
      metadata: {
        contentType: 'application/gzip',
        metadata: {
          collections: config.collections.join(','),
          timestamp: timestamp,
          type: 'automated-backup'
        }
      }
    })

    // Log successful backup
    await logSystemAction(
      'database backup',
      systemUser,
      `Successfully backed up collections: ${config.collections.join(', ')}`,
      true,
      'info'
    )

    // Clean up old backups
    await cleanupOldBackups(config)
  } catch (error) {
    console.error('Backup failed:', error)
    await logSystemAction(
      'database backup',
      systemUser,
      `Backup failed for collections: ${config.collections.join(', ')}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      false,
      'critical'
    )
  }
}

const cleanupOldBackups = async (config: BackupConfig): Promise<void> => {
  try {
    const [files] = await bucket.getFiles({
      prefix: config.backupPath
    })

    const now = new Date()
    const retentionDate = new Date(now.getTime() - (config.retentionDays * 24 * 60 * 60 * 1000))

    for (const file of files) {
      if (file.metadata.timeCreated) {
        const fileDate = new Date(file.metadata.timeCreated)
        if (fileDate < retentionDate) {
          await file.delete()
        }
      }
    }

    await logSystemAction(
      'backup cleanup',
      systemUser,
      `Cleaned up backups older than ${config.retentionDays} days for ${config.backupPath}`,
      true,
      'info'
    )
  } catch (error) {
    console.error('Backup cleanup failed:', error)
    await logSystemAction(
      'backup cleanup',
      systemUser,
      `Failed to clean up old backups for ${config.backupPath}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      false,
      'warning'
    )
  }
}

export const restoreBackup = async (backupPath: string): Promise<void> => {
  try {
    const file = bucket.file(backupPath)
    const [data] = await file.download()
    const backupData = JSON.parse(data.toString())

    const batch = db.batch()
    let operationCount = 0
    const MAX_BATCH_SIZE = 500

    for (const [collectionName, documents] of Object.entries(backupData)) {
      for (const doc of documents as any[]) {
        const { id, ...data } = doc
        const ref = db.collection(collectionName).doc(id)
        batch.set(ref, data)
        operationCount++

        if (operationCount >= MAX_BATCH_SIZE) {
          await batch.commit()
          operationCount = 0
        }
      }
    }

    if (operationCount > 0) {
      await batch.commit()
    }

    await logSystemAction(
      'database restore',
      systemUser,
      `Successfully restored backup from ${backupPath}`,
      true,
      'warning'
    )
  } catch (error) {
    console.error('Restore failed:', error)
    await logSystemAction(
      'database restore',
      systemUser,
      `Failed to restore backup from ${backupPath}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      false,
      'critical'
    )
    throw error
  }
}

export const listBackups = async (): Promise<Array<{
  path: string
  timestamp: string
  collections: string[]
  size: number
}>> => {
  try {
    const [files] = await bucket.getFiles({
      prefix: 'backups/'
    })

    return files
      .filter(file => 
        file.metadata.timeCreated && 
        file.metadata.metadata?.collections &&
        typeof file.metadata.metadata.collections === 'string' &&
        file.metadata.size
      )
      .map(file => ({
        path: file.name,
        timestamp: file.metadata.timeCreated as string,
        collections: (file.metadata.metadata?.collections as string).split(','),
        size: parseInt(file.metadata.size as string)
      }))
  } catch (error) {
    console.error('Failed to list backups:', error)
    throw error
  }
}

// Schedule backups based on configuration
export const scheduleBackups = (): void => {
  setInterval(() => {
    const now = new Date()
    
    backupConfigs.forEach(config => {
      const shouldRun = (() => {
        switch (config.schedule.frequency) {
          case 'hourly':
            return true
          case 'daily':
            return now.getHours() === config.schedule.hour
          case 'weekly':
            return now.getDay() === config.schedule.dayOfWeek && 
                   now.getHours() === config.schedule.hour
          default:
            return false
        }
      })()

      if (shouldRun) {
        performBackup(config).catch(console.error)
      }
    })
  }, 60 * 60 * 1000) // Check every hour
} 