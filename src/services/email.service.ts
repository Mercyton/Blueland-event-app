import nodemailer from 'nodemailer'

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_EMAIL,
        pass: process.env.ETHEREAL_PASSWORD
      }
    })
  }

  async sendWelcomeEmail(to: string) {
    const mailOptions = {
      from: '"Event App" <noreply@eventapp.com>',
      to,
      subject: 'Welcome to Event Management App!',
      html: `
        <h1>Welcome to our Event Management Platform!</h1>
        <p>Your account has been successfully created.</p>
        <p>You can now create events, RSVP to events, and receive real-time updates.</p>
        <br/>
        <p><em>This is a mock email from Ethereal service.</em></p>
      `
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Welcome email sent:', info.messageId)
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
      return info
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  async sendEventNotification(to: string, eventTitle: string, action: string) {
    const mailOptions = {
      from: '"Event App" <noreply@eventapp.com>',
      to,
      subject: `Event Update: ${eventTitle}`,
      html: `
        <h2>Event ${action}</h2>
        <p>The event "${eventTitle}" has been ${action}.</p>
        <br/>
        <p><em>This is a mock notification email.</em></p>
      `
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Event notification sent:', info.messageId)
      return info
    } catch (error) {
      console.error('Error sending event notification:', error)
      throw error
    }
  }
}

export const emailService = new EmailService()