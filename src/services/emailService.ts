import { getFunctions, httpsCallable } from 'firebase/functions'
import { logSystemAction } from './activityLogger'

interface EmailData {
  to: string
  subject: string
  text: string
  html?: string
}

class EmailService {
  private functions = getFunctions()

  async sendEmail(data: EmailData): Promise<void> {
    try {
      const sendEmailFunction = httpsCallable(this.functions, 'sendEmail')
      await sendEmailFunction(data)

      await logSystemAction(
        'email_sent',
        { id: 'system', name: 'System', role: 'system' },
        `Email sent to ${data.to}: ${data.subject}`,
        true,
        'info'
      )
    } catch (error) {
      console.error('Failed to send email:', error)
      await logSystemAction(
        'email_failed',
        { id: 'system', name: 'System', role: 'system' },
        `Failed to send email to ${data.to}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        false,
        'critical'
      )
      throw error
    }
  }

  // Predefined email templates
  async sendCriticalActionAlert(
    to: string,
    action: string,
    performer: { name: string; role: string },
    details: string
  ): Promise<void> {
    const subject = `[HopeHand] Critical Action Alert: ${action}`
    const html = `
      <h2>Critical Action Performed</h2>
      <p><strong>Action:</strong> ${action}</p>
      <p><strong>Performed By:</strong> ${performer.name} (${performer.role})</p>
      <p><strong>Details:</strong> ${details}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p>This is an automated alert from the HopeHand system. Please review this action immediately if it was not authorized.</p>
    `

    await this.sendEmail({
      to,
      subject,
      text: `Critical Action Alert: ${action}\n\nPerformed By: ${performer.name} (${performer.role})\nDetails: ${details}\nTime: ${new Date().toLocaleString()}`,
      html
    })
  }

  async sendSettingsChangeAlert(
    to: string,
    setting: string,
    oldValue: string,
    newValue: string,
    performer: { name: string; role: string }
  ): Promise<void> {
    const subject = `[HopeHand] Settings Change Alert: ${setting}`
    const html = `
      <h2>System Settings Changed</h2>
      <p><strong>Setting:</strong> ${setting}</p>
      <p><strong>Old Value:</strong> ${oldValue}</p>
      <p><strong>New Value:</strong> ${newValue}</p>
      <p><strong>Changed By:</strong> ${performer.name} (${performer.role})</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p>This is an automated alert from the HopeHand system. If you did not authorize this change, please review immediately.</p>
    `

    await this.sendEmail({
      to,
      subject,
      text: `Settings Change Alert: ${setting}\n\nOld Value: ${oldValue}\nNew Value: ${newValue}\nChanged By: ${performer.name} (${performer.role})\nTime: ${new Date().toLocaleString()}`,
      html
    })
  }
}

const emailService = new EmailService()
export default emailService 