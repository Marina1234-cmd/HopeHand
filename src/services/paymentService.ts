import { loadStripe } from '@stripe/stripe-js'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore'
import { logSystemAction } from './activityLogger'
import securityMonitorService from './securityMonitorService'
import notificationService from './notificationService'

interface PaymentDetails {
  amount: number
  currency: string
  description: string
  campaignId: string
  donorId: string
  donorEmail: string
  donorName: string
  metadata?: Record<string, any>
}

interface FraudCheckResult {
  isHighRisk: boolean
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
  score: number
}

type PaymentGateway = 'stripe' | 'paypal' | 'netopia'

interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  gatewayResponse?: any
}

class PaymentService {
  private stripe: any
  private readonly RISK_THRESHOLDS = {
    AMOUNT_THRESHOLD: 10000, // $10,000
    FREQUENCY_THRESHOLD: 5, // transactions per hour
    VELOCITY_THRESHOLD: 1000, // dollars per minute
    LOCATION_MISMATCH_SCORE: 0.5,
    CARD_REUSE_SCORE: 0.3,
    SUSPICIOUS_PATTERN_SCORE: 0.4
  }

  constructor() {
    this.initializeStripe()
  }

  private async initializeStripe() {
    this.stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!)
  }

  // Process payment through selected gateway
  async processPayment(
    gateway: PaymentGateway,
    paymentDetails: PaymentDetails,
    paymentMethod?: any
  ): Promise<PaymentResult> {
    try {
      // Perform fraud check before processing
      const fraudCheck = await this.performFraudCheck(paymentDetails)
      
      if (fraudCheck.isHighRisk) {
        await this.handleHighRiskPayment(paymentDetails, fraudCheck)
        throw new Error('Payment blocked due to high fraud risk')
      }

      let result: PaymentResult

      switch (gateway) {
        case 'stripe':
          result = await this.processStripePayment(paymentDetails, paymentMethod)
          break
        case 'paypal':
          result = await this.processPayPalPayment(paymentDetails)
          break
        case 'netopia':
          result = await this.processNetopiaPayment(paymentDetails)
          break
        default:
          throw new Error('Unsupported payment gateway')
      }

      if (result.success) {
        await this.logSuccessfulPayment(gateway, paymentDetails, result)
      }

      return result
    } catch (error) {
      await this.logFailedPayment(gateway, paymentDetails, error)
      throw error
    }
  }

  // Stripe payment processing
  private async processStripePayment(
    paymentDetails: PaymentDetails,
    paymentMethod: any
  ): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: paymentDetails.amount * 100, // Convert to cents
        currency: paymentDetails.currency,
        payment_method: paymentMethod.id,
        confirmation_method: 'manual',
        confirm: true,
        description: paymentDetails.description,
        metadata: {
          campaignId: paymentDetails.campaignId,
          donorId: paymentDetails.donorId,
          ...paymentDetails.metadata
        }
      })

      return {
        success: true,
        transactionId: paymentIntent.id,
        gatewayResponse: paymentIntent
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        gatewayResponse: error
      }
    }
  }

  // PayPal payment processing
  private async processPayPalPayment(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    try {
      // Initialize PayPal order
      const order = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          description: paymentDetails.description,
          metadata: {
            campaignId: paymentDetails.campaignId,
            donorId: paymentDetails.donorId,
            ...paymentDetails.metadata
          }
        })
      }).then(res => res.json())

      return {
        success: true,
        transactionId: order.id,
        gatewayResponse: order
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PayPal payment failed',
        gatewayResponse: error
      }
    }
  }

  // Netopia payment processing
  private async processNetopiaPayment(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    try {
      // Initialize Netopia payment
      const payment = await fetch('/api/netopia/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          description: paymentDetails.description,
          orderId: `${Date.now()}-${paymentDetails.campaignId}`,
          metadata: {
            campaignId: paymentDetails.campaignId,
            donorId: paymentDetails.donorId,
            ...paymentDetails.metadata
          }
        })
      }).then(res => res.json())

      return {
        success: true,
        transactionId: payment.paymentId,
        gatewayResponse: payment
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netopia payment failed',
        gatewayResponse: error
      }
    }
  }

  // Fraud detection system
  private async performFraudCheck(paymentDetails: PaymentDetails): Promise<FraudCheckResult> {
    const riskFactors: string[] = []
    let riskScore = 0

    // Check 1: Amount threshold
    if (paymentDetails.amount >= this.RISK_THRESHOLDS.AMOUNT_THRESHOLD) {
      riskFactors.push('Large transaction amount')
      riskScore += 0.4
    }

    // Check 2: Transaction frequency
    const recentTransactions = await this.getRecentTransactions(paymentDetails.donorId)
    if (recentTransactions.length >= this.RISK_THRESHOLDS.FREQUENCY_THRESHOLD) {
      riskFactors.push('High transaction frequency')
      riskScore += 0.3
    }

    // Check 3: Transaction velocity
    const velocityScore = await this.checkTransactionVelocity(paymentDetails.donorId)
    if (velocityScore > this.RISK_THRESHOLDS.VELOCITY_THRESHOLD) {
      riskFactors.push('Unusual transaction velocity')
      riskScore += 0.4
    }

    // Check 4: Location mismatch
    const locationMismatch = await this.checkLocationMismatch(paymentDetails.donorId)
    if (locationMismatch) {
      riskFactors.push('Location mismatch')
      riskScore += this.RISK_THRESHOLDS.LOCATION_MISMATCH_SCORE
    }

    // Check 5: Card reuse patterns
    const cardReuse = await this.checkCardReusePatterns(paymentDetails.donorId)
    if (cardReuse) {
      riskFactors.push('Suspicious card usage pattern')
      riskScore += this.RISK_THRESHOLDS.CARD_REUSE_SCORE
    }

    return {
      isHighRisk: riskScore >= 0.7,
      riskLevel: riskScore >= 0.7 ? 'high' : riskScore >= 0.4 ? 'medium' : 'low',
      riskFactors,
      score: riskScore
    }
  }

  private async getRecentTransactions(donorId: string): Promise<any[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const snapshot = await getDocs(
      query(
        collection(db, 'transactions'),
        where('donorId', '==', donorId),
        where('timestamp', '>=', oneHourAgo)
      )
    )

    return snapshot.docs.map(doc => doc.data())
  }

  private async checkTransactionVelocity(donorId: string): Promise<number> {
    const recentTransactions = await this.getRecentTransactions(donorId)
    if (recentTransactions.length < 2) return 0

    const amounts = recentTransactions.map(t => t.amount)
    const timestamps = recentTransactions.map(t => t.timestamp.toDate().getTime())
    
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0)
    const timeSpan = Math.max(...timestamps) - Math.min(...timestamps)
    
    return timeSpan > 0 ? (totalAmount / (timeSpan / 60000)) : 0 // Amount per minute
  }

  private async checkLocationMismatch(donorId: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', donorId))
    const userData = userDoc.data()
    
    if (!userData?.lastLoginLocation) return false

    const currentIP = await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => data.ip)
    
    const locationData = await fetch(`https://ipapi.co/${currentIP}/json/`)
      .then(res => res.json())

    return userData.lastLoginLocation.country !== locationData.country
  }

  private async checkCardReusePatterns(donorId: string): Promise<boolean> {
    const snapshot = await getDocs(
      query(
        collection(db, 'paymentMethods'),
        where('donorId', '==', donorId)
      )
    )

    const paymentMethods = snapshot.docs.map(doc => doc.data())
    const uniqueCards = new Set(paymentMethods.map(pm => pm.lastFour))
    
    return paymentMethods.length > uniqueCards.size * 3 // More than 3 times reuse of same cards
  }

  private async handleHighRiskPayment(
    paymentDetails: PaymentDetails,
    fraudCheck: FraudCheckResult
  ): Promise<void> {
    // Log security event
    await securityMonitorService.trackSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      source: {
        ip: await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip),
        userAgent: navigator.userAgent
      },
      details: `High-risk payment attempt: ${fraudCheck.riskFactors.join(', ')}`,
      userId: paymentDetails.donorId
    })

    // Notify admins
    const adminSnapshot = await getDocs(
      query(collection(db, 'users'), where('role', '==', 'admin'))
    )

    const notificationPromises = adminSnapshot.docs.map(doc =>
      notificationService.createNotification({
        type: 'system',
        title: 'High-Risk Payment Blocked',
        message: `Suspicious payment attempt by ${paymentDetails.donorName} (${paymentDetails.donorEmail})`,
        recipientId: doc.id,
        priority: 'high',
        data: {
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          riskFactors: fraudCheck.riskFactors,
          riskScore: fraudCheck.score
        }
      })
    )

    await Promise.all(notificationPromises)

    // Log the blocked transaction
    await addDoc(collection(db, 'blockedTransactions'), {
      ...paymentDetails,
      timestamp: new Date(),
      riskAssessment: fraudCheck,
      reason: 'High fraud risk'
    })
  }

  private async logSuccessfulPayment(
    gateway: PaymentGateway,
    paymentDetails: PaymentDetails,
    result: PaymentResult
  ): Promise<void> {
    await addDoc(collection(db, 'transactions'), {
      ...paymentDetails,
      gateway,
      transactionId: result.transactionId,
      status: 'completed',
      timestamp: new Date()
    })

    await logSystemAction(
      'payment_success',
      { id: paymentDetails.donorId, name: paymentDetails.donorName, role: 'user' },
      `Successful ${gateway} payment of ${paymentDetails.amount} ${paymentDetails.currency}`,
      true,
      'info'
    )
  }

  private async logFailedPayment(
    gateway: PaymentGateway,
    paymentDetails: PaymentDetails,
    error: any
  ): Promise<void> {
    await addDoc(collection(db, 'transactions'), {
      ...paymentDetails,
      gateway,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    })

    await logSystemAction(
      'payment_failed',
      { id: paymentDetails.donorId, name: paymentDetails.donorName, role: 'user' },
      `Failed ${gateway} payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      false,
      'warning'
    )
  }
}

const paymentService = new PaymentService()
export default paymentService 