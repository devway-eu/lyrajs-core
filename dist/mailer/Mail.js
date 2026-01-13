import { Config } from "../config/index.js";
const mailFrom = new Config().get("mailer.sender");
/**
 * Mail class
 * Represents an email message with sender, recipient, subject, and HTML content
 * Automatically sets the sender from mailer.sender configuration
 */
export class Mail {
    /**
     * Creates a new Mail instance
     * Sender address is automatically loaded from configuration
     * @param {string} to - Recipient email address
     * @param {string} subject - Email subject line
     * @param {string} html - Email body in HTML format
     * @param attachments - Email attached files
     * @example
     * const mail = new Mail(
     *   'user@example.com',
     *   'Welcome to LyraJS',
     *   '<h1>Hello!</h1><p>Welcome aboard.</p>'
     * )
     */
    constructor(to, subject, html, attachments) {
        this.from = mailFrom;
        this.to = to;
        this.subject = subject;
        this.html = html;
        this.attachments = attachments;
    }
    addAttachment(attachment) {
        this.attachments.push(attachment);
        return this;
    }
}
//# sourceMappingURL=Mail.js.map