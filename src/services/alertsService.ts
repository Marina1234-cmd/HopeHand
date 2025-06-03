import { db } from '../config/firebase'
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  getDocs,
  setDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore'
import { logSystemAction } from './activityLogger'

export interface AlertRule {
  id: string
  type: 'financial' | 'activity'
  metric: string
  threshold: number
  timeWindow?: number // in minutes
  comparison: 'greater' | 'less' | 'equal' | 'spike'
  enabled: boolean
  notifyRoles: string[]
  message: string
  cooldown: number // in minutes
  lastTriggered?: Date
}

export interface AlertInstance {
  id: string
  ruleId: string
  timestamp: Date
  value: number
  message: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}

class AlertsService {
  private static RULES_COLLECTION = 'alertRules'
  private static ALERTS_COLLECTION = 'alerts'
  private static METRICS_COLLECTION = 'metrics'
  
  private activeRules: Map<string, AlertRule> = new Map()
  private metricsListeners: Map<string, () => void> = new Map()

  constructor() {
    this.initializeRulesListener()
  }

  private async initializeRulesListener() {
    // Listen for changes in alert rules
    onSnapshot(collection(db, AlertsService.RULES_COLLECTION), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const rule = { id: change.doc.id, ...change.doc.data() } as AlertRule
        
        if (change.type === 'removed') {
          this.activeRules.delete(rule.id)
          // Remove metric listener if exists
          const unsubscribe = this.metricsListeners.get(rule.id)
          if (unsubscribe) {
            unsubscribe()
            this.metricsListeners.delete(rule.id)
          }
        } else {
          // Add or update rule
          this.activeRules.set(rule.id, rule)
          if (rule.enabled) {
            this.setupMetricListener(rule)
          }
        }
      })
    })
  }

  private setupMetricListener(rule: AlertRule) {
    // Remove existing listener if any
    const existingUnsubscribe = this.metricsListeners.get(rule.id)
    if (existingUnsubscribe) {
      existingUnsubscribe()
    }

    // Create new listener based on rule type
    let unsubscribe: () => void
    
    if (rule.type === 'financial') {
      unsubscribe = this.setupFinancialMetricListener(rule)
    } else {
      unsubscribe = this.setupActivityMetricListener(rule)
    }

    this.metricsListeners.set(rule.id, unsubscribe)
  }

  private setupFinancialMetricListener(rule: AlertRule): () => void {
    const metricsRef = collection(db, AlertsService.METRICS_COLLECTION)
    
    return onSnapshot(
      query(metricsRef, where('type', '==', rule.metric)),
      async (snapshot) => {
        await this.processMetricUpdate(rule, snapshot)
      }
    )
  }

  private setupActivityMetricListener(rule: AlertRule): () => void {
    const metricsRef = collection(db, AlertsService.METRICS_COLLECTION)
    
    return onSnapshot(
      query(
        metricsRef,
        where('type', '==', rule.metric),
        where('timestamp', '>=', new Date(Date.now() - (rule.timeWindow || 5) * 60000))
      ),
      async (snapshot) => {
        await this.processMetricUpdate(rule, snapshot)
      }
    )
  }

  private async processMetricUpdate(
    rule: AlertRule,
    snapshot: QuerySnapshot<DocumentData>
  ) {
    if (!rule.enabled) return

    // Check if we're still in cooldown period
    if (rule.lastTriggered) {
      const cooldownEnd = new Date(rule.lastTriggered.getTime() + rule.cooldown * 60000)
      if (cooldownEnd > new Date()) return
    }

    let shouldTrigger = false
    let currentValue = 0

    if (rule.comparison === 'spike') {
      // Calculate rate of change for activity metrics
      const values = snapshot.docs.map(doc => ({
        value: doc.data().value as number,
        timestamp: (doc.data().timestamp as Timestamp).toDate()
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

      if (values.length >= 2) {
        const timeSpan = (values[values.length - 1].timestamp.getTime() - values[0].timestamp.getTime()) / 60000 // in minutes
        const valueChange = values[values.length - 1].value - values[0].value
        const rate = valueChange / timeSpan

        currentValue = rate
        shouldTrigger = rate > rule.threshold
      }
    } else {
      // Sum up values for the time window
      currentValue = snapshot.docs.reduce((sum, doc) => sum + (doc.data().value as number), 0)
      
      switch (rule.comparison) {
        case 'greater':
          shouldTrigger = currentValue > rule.threshold
          break
        case 'less':
          shouldTrigger = currentValue < rule.threshold
          break
        case 'equal':
          shouldTrigger = currentValue === rule.threshold
          break
      }
    }

    if (shouldTrigger) {
      await this.createAlert(rule, currentValue)
    }
  }

  private async createAlert(rule: AlertRule, value: number) {
    try {
      const alert: Omit<AlertInstance, 'id'> = {
        ruleId: rule.id,
        timestamp: new Date(),
        value,
        message: this.formatAlertMessage(rule, value),
        acknowledged: false
      }

      // Create alert document
      await addDoc(collection(db, AlertsService.ALERTS_COLLECTION), {
        ...alert,
        timestamp: serverTimestamp()
      })

      // Update rule's lastTriggered timestamp
      await setDoc(
        doc(db, AlertsService.RULES_COLLECTION, rule.id),
        { lastTriggered: serverTimestamp() },
        { merge: true }
      )

      // Log the alert
      await logSystemAction(
        'alert_triggered',
        { id: rule.id, type: rule.type },
        `Alert triggered: ${rule.message} (Value: ${value})`,
        true,
        'warning'
      )
    } catch (error) {
      console.error('Failed to create alert:', error)
      throw error
    }
  }

  private formatAlertMessage(rule: AlertRule, value: number): string {
    const baseMessage = rule.message.replace('{value}', value.toString())
    
    if (rule.comparison === 'spike') {
      return `${baseMessage} (Rate: ${value.toFixed(2)} per minute)`
    }
    
    return baseMessage
  }

  async createRule(rule: Omit<AlertRule, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, AlertsService.RULES_COLLECTION), {
        ...rule,
        enabled: true,
        lastTriggered: null
      })

      await logSystemAction(
        'alert_rule_created',
        { id: docRef.id, type: rule.type },
        `Alert rule created: ${rule.message}`,
        true,
        'info'
      )

      return docRef.id
    } catch (error) {
      console.error('Failed to create alert rule:', error)
      throw error
    }
  }

  async updateRule(ruleId: string, updates: Partial<AlertRule>): Promise<void> {
    try {
      await setDoc(
        doc(db, AlertsService.RULES_COLLECTION, ruleId),
        updates,
        { merge: true }
      )

      await logSystemAction(
        'alert_rule_updated',
        { id: ruleId },
        `Alert rule updated: ${updates.message || 'No message update'}`,
        true,
        'info'
      )
    } catch (error) {
      console.error('Failed to update alert rule:', error)
      throw error
    }
  }

  async deleteRule(ruleId: string): Promise<void> {
    try {
      await setDoc(
        doc(db, AlertsService.RULES_COLLECTION, ruleId),
        { enabled: false },
        { merge: true }
      )

      await logSystemAction(
        'alert_rule_deleted',
        { id: ruleId },
        'Alert rule deleted',
        true,
        'info'
      )
    } catch (error) {
      console.error('Failed to delete alert rule:', error)
      throw error
    }
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      await setDoc(
        doc(db, AlertsService.ALERTS_COLLECTION, alertId),
        {
          acknowledged: true,
          acknowledgedBy: userId,
          acknowledgedAt: serverTimestamp()
        },
        { merge: true }
      )

      await logSystemAction(
        'alert_acknowledged',
        { id: alertId, userId },
        'Alert acknowledged',
        true,
        'info'
      )
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
      throw error
    }
  }

  async getActiveAlerts(): Promise<AlertInstance[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, AlertsService.ALERTS_COLLECTION),
          where('acknowledged', '==', false)
        )
      )

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate(),
        acknowledgedAt: doc.data().acknowledgedAt 
          ? (doc.data().acknowledgedAt as Timestamp).toDate()
          : undefined
      })) as AlertInstance[]
    } catch (error) {
      console.error('Failed to get active alerts:', error)
      throw error
    }
  }
}

const alertsService = new AlertsService()
export default alertsService 