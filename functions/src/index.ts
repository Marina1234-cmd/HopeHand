import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as nodemailer from 'nodemailer'

admin.initializeApp()

interface EmailData {
  to: string
  subject: string
  text: string
  html?: string
}

// Initialize nodemailer with SMTP configuration
// Note: In production, use environment variables for sensitive data
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Cloud Function to send emails
export const sendEmail = functions.https.onCall(async (data: EmailData, context) => {
  // Check if the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    )
  }

  try {
    // Get user's role from Firestore
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get()

    const userData = userDoc.data()

    // Only allow admins or system to send emails
    if (userData?.role !== 'admin' && context.auth.uid !== 'system') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can send emails.'
      )
    }

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@hopehand.org',
      ...data
    })

    // Log email sent
    await admin.firestore().collection('emailLogs').add({
      to: data.to,
      subject: data.subject,
      sentBy: context.auth.uid,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      success: true
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)

    // Log email failure
    await admin.firestore().collection('emailLogs').add({
      to: data.to,
      subject: data.subject,
      sentBy: context.auth?.uid || 'system',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    throw new functions.https.HttpsError(
      'internal',
      'Failed to send email.',
      error instanceof Error ? error.message : undefined
    )
  }
}) 