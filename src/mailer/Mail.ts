import { Config } from "@/core/config"

const mailFrom = new Config().get("mailer.sender")

/**
 * Mail class
 * Represents an email message with sender, recipient, subject, and HTML content
 * Automatically sets the sender from mailer.sender configuration
 */
export class Mail {
  public from: string
  public to: string
  public subject: string
  public html: string

  /**
   * Creates a new Mail instance
   * Sender address is automatically loaded from configuration
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject line
   * @param {string} html - Email body in HTML format
   * @example
   * const mail = new Mail(
   *   'user@example.com',
   *   'Welcome to LyraJS',
   *   '<h1>Hello!</h1><p>Welcome aboard.</p>'
   * )
   */
  constructor(to: string, subject: string, html: string) {
    this.from = mailFrom
    this.to = to
    this.subject = subject
    this.html = html
  }
}
