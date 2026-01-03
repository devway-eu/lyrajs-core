import { Mail } from "./Mail"
import { Transporter } from "./Transporter"

/**
 * Mailer class
 * Service for sending individual and bulk emails via SMTP
 * Supports queuing multiple emails for batch sending
 */
class Mailer {
  protected transporter
  protected mails: Mail[] = []

  /**
   * Creates a new Mailer instance
   * Initializes with configured SMTP transporter
   * @returns {Mailer} - Mailer instance for chaining
   */
  constructor() {
    this.transporter = Transporter
    return this
  }

  /**
   * Sends a single email immediately
   * @param {Mail} mail - Mail object containing email details
   * @returns {Promise<void>}
   * @example
   * const mail = new Mail('user@example.com', 'Subject', '<p>Body</p>')
   * await mailer.send(mail)
   */
  public async send(mail: Mail) {
    await this.transporter.sendMail(mail)
  }

  /**
   * Adds an email to the queue for bulk sending
   * @param {Mail} email - Mail object to queue
   * @returns {Mailer} - Mailer instance for method chaining
   * @example
   * mailer.addMail(mail1).addMail(mail2).addMail(mail3)
   * await mailer.sendBulk()
   */
  public addMail(email: Mail) {
    this.mails.push(email)
    return this
  }

  /**
   * Sends all queued emails in sequence
   * Clears the queue after sending
   * @returns {Promise<void>}
   * @example
   * mailer.addMail(mail1).addMail(mail2)
   * await mailer.sendBulk()
   */
  public async sendBulk() {
    for (const mail of this.mails) {
      await this.transporter.sendMail(mail)
    }
    this.mails = []
  }
}

/**
 * Singleton mailer instance
 * Provides centralized email sending functionality throughout the application
 * @example
 * import { mailer, Mail } from '@lyra-js/core'
 * const mail = new Mail('user@example.com', 'Subject', '<p>Content</p>')
 * await mailer.send(mail)
 */
export const mailer = new Mailer()
