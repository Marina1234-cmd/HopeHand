import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'
import fetch from 'node-fetch'
import crypto from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// PayPal API configuration
const PAYPAL_API = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

const paypalAuth = Buffer.from(
  `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
).toString('base64')

// Netopia configuration
const NETOPIA_PUBLIC_KEY = process.env.NETOPIA_PUBLIC_KEY!
const NETOPIA_PRIVATE_KEY = process.env.NETOPIA_PRIVATE_KEY!
const NETOPIA_API = process.env.NODE_ENV === 'production'
  ? 'https://secure.mobilpay.ro'
  : 'https://sandboxsecure.mobilpay.ro'

// Create PayPal order
export const createPayPalOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to create order'
    )
  }

  try {
    // Get PayPal access token
    const tokenResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${paypalAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    const { access_token } = await tokenResponse.json()

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: data.currency,
            value: data.amount.toString()
          },
          description: data.description,
          custom_id: data.metadata.campaignId
        }]
      })
    })

    const order = await orderResponse.json()

    // Log order creation
    await admin.firestore().collection('paypalOrders').add({
      orderId: order.id,
      amount: data.amount,
      currency: data.currency,
      metadata: data.metadata,
      status: order.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return order
  } catch (error) {
    console.error('PayPal order creation failed:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create PayPal order'
    )
  }
})

// Capture PayPal payment
export const capturePayPalPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to capture payment'
    )
  }

  try {
    // Get PayPal access token
    const tokenResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${paypalAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    const { access_token } = await tokenResponse.json()

    // Capture payment
    const captureResponse = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${data.orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const captureResult = await captureResponse.json()

    // Update order status
    await admin.firestore().collection('paypalOrders')
      .where('orderId', '==', data.orderId)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          snapshot.docs[0].ref.update({
            status: captureResult.status,
            capturedAt: admin.firestore.FieldValue.serverTimestamp()
          })
        }
      })

    return captureResult
  } catch (error) {
    console.error('PayPal payment capture failed:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to capture PayPal payment'
    )
  }
})

// Create Netopia payment
export const createNetopiaPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to create payment'
    )
  }

  try {
    // Create payment request
    const paymentRequest = {
      order: {
        id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        details: data.description
      },
      url: {
        return: `${process.env.APP_URL}/payment/success`,
        confirm: `${process.env.APP_URL}/api/netopia/confirm`
      }
    }

    // Sign the request
    const signature = crypto
      .createHmac('sha256', NETOPIA_PRIVATE_KEY)
      .update(JSON.stringify(paymentRequest))
      .digest('hex')

    // Send request to Netopia
    const response = await fetch(`${NETOPIA_API}/api/payment/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': NETOPIA_PUBLIC_KEY,
        'X-SIGNATURE': signature
      },
      body: JSON.stringify(paymentRequest)
    })

    const result = await response.json()

    // Log payment initialization
    await admin.firestore().collection('netopiaPayments').add({
      paymentId: result.paymentId,
      orderId: data.orderId,
      amount: data.amount,
      currency: data.currency,
      metadata: data.metadata,
      status: 'initialized',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return result
  } catch (error) {
    console.error('Netopia payment creation failed:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create Netopia payment'
    )
  }
})

// Handle Netopia payment confirmation
export const handleNetopiaConfirmation = functions.https.onRequest(async (req, res) => {
  try {
    const signature = req.headers['x-signature']
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', NETOPIA_PRIVATE_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex')

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature')
    }

    const { paymentId, status, amount } = req.body

    // Update payment status
    await admin.firestore().collection('netopiaPayments')
      .where('paymentId', '==', paymentId)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          snapshot.docs[0].ref.update({
            status,
            confirmedAmount: amount,
            confirmedAt: admin.firestore.FieldValue.serverTimestamp()
          })
        }
      })

    res.status(200).send('OK')
  } catch (error) {
    console.error('Netopia confirmation failed:', error)
    res.status(500).send('Error processing confirmation')
  }
}) 