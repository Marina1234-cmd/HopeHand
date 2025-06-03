import { db } from '../config/firebase'
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { logSystemAction } from './activityLogger'

export interface MaintenanceState {
  enabled: boolean
  startTime: Date
  endTime?: Date
  reason: string
  allowedOperations: string[]
  affectedServices: string[]
  message: string
  adminMessage?: string
  updatedAt: Date
  updatedBy: string
}

class MaintenanceService {
  private static MAINTENANCE_DOC = 'system/maintenance'
  private maintenanceState: MaintenanceState | null = null
  private listeners: Set<(state: MaintenanceState | null) => void> = new Set()

  constructor() {
    this.initializeListener()
  }

  private async initializeListener() {
    // Listen for maintenance state changes
    onSnapshot(doc(db, MaintenanceService.MAINTENANCE_DOC), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as MaintenanceState & { startTime: Timestamp, endTime?: Timestamp, updatedAt: Timestamp }
        this.maintenanceState = {
          ...data,
          startTime: data.startTime.toDate(),
          endTime: data.endTime?.toDate(),
          updatedAt: data.updatedAt.toDate()
        }
      } else {
        this.maintenanceState = null
      }

      // Notify all listeners
      this.notifyListeners()
    })
  }

  async enableMaintenance(
    options: {
      reason: string
      endTime?: Date
      allowedOperations?: string[]
      affectedServices?: string[]
      message?: string
      adminMessage?: string
    },
    userId: string
  ): Promise<void> {
    try {
      const maintenanceState: MaintenanceState = {
        enabled: true,
        startTime: new Date(),
        endTime: options.endTime,
        reason: options.reason,
        allowedOperations: options.allowedOperations || ['read'],
        affectedServices: options.affectedServices || ['all'],
        message: options.message || 'System is currently in maintenance mode. Only read operations are allowed.',
        adminMessage: options.adminMessage,
        updatedAt: new Date(),
        updatedBy: userId
      }

      await setDoc(doc(db, MaintenanceService.MAINTENANCE_DOC), {
        ...maintenanceState,
        startTime: Timestamp.fromDate(maintenanceState.startTime),
        endTime: maintenanceState.endTime ? Timestamp.fromDate(maintenanceState.endTime) : null,
        updatedAt: serverTimestamp()
      })

      await logSystemAction(
        'maintenance_mode',
        { id: userId, action: 'enable' },
        `Maintenance mode enabled: ${options.reason}`,
        true,
        'warning'
      )
    } catch (error) {
      console.error('Failed to enable maintenance mode:', error)
      throw error
    }
  }

  async disableMaintenance(userId: string): Promise<void> {
    try {
      const maintenanceRef = doc(db, MaintenanceService.MAINTENANCE_DOC)
      const snapshot = await getDoc(maintenanceRef)

      if (snapshot.exists()) {
        await setDoc(maintenanceRef, {
          enabled: false,
          endTime: serverTimestamp(),
          updatedAt: serverTimestamp(),
          updatedBy: userId
        }, { merge: true })

        await logSystemAction(
          'maintenance_mode',
          { id: userId, action: 'disable' },
          'Maintenance mode disabled',
          true,
          'info'
        )
      }
    } catch (error) {
      console.error('Failed to disable maintenance mode:', error)
      throw error
    }
  }

  async getMaintenanceState(): Promise<MaintenanceState | null> {
    try {
      const snapshot = await getDoc(doc(db, MaintenanceService.MAINTENANCE_DOC))
      
      if (snapshot.exists()) {
        const data = snapshot.data() as MaintenanceState & { startTime: Timestamp, endTime?: Timestamp, updatedAt: Timestamp }
        return {
          ...data,
          startTime: data.startTime.toDate(),
          endTime: data.endTime?.toDate(),
          updatedAt: data.updatedAt.toDate()
        }
      }
      
      return null
    } catch (error) {
      console.error('Failed to get maintenance state:', error)
      throw error
    }
  }

  isOperationAllowed(operation: string): boolean {
    if (!this.maintenanceState?.enabled) return true
    return this.maintenanceState.allowedOperations.includes(operation)
  }

  isServiceAffected(service: string): boolean {
    if (!this.maintenanceState?.enabled) return false
    return this.maintenanceState.affectedServices.includes('all') ||
           this.maintenanceState.affectedServices.includes(service)
  }

  subscribe(listener: (state: MaintenanceState | null) => void): () => void {
    this.listeners.add(listener)
    
    // Immediately notify the new listener of the current state
    if (this.maintenanceState !== undefined) {
      listener(this.maintenanceState)
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.maintenanceState)
    })
  }
}

const maintenanceService = new MaintenanceService()
export default maintenanceService 