import { scheduleBackups } from '../services/backupService'
import { logSystemAction } from '../services/activityLogger'

const initializeBackupService = async () => {
  try {
    // Start the backup scheduler
    scheduleBackups()

    await logSystemAction(
      'backup service',
      { id: 'backup-service', name: 'Backup Service', role: 'admin' },
      'Backup service initialized successfully',
      true,
      'info'
    )

    console.log('Backup service initialized successfully')
  } catch (error) {
    console.error('Failed to initialize backup service:', error)
    process.exit(1)
  }
}

// Start the backup service
initializeBackupService() 