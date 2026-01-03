/**
 * Mail class
 * Represents an email message with sender, recipient, subject, and HTML content
 * Automatically sets the sender from mailer.sender configuration
 */
export declare class Mail {
    from: string;
    to: string;
    subject: string;
    html: string;
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
    constructor(to: string, subject: string, html: string);
}
