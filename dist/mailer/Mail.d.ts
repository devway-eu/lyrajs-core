export interface Attachment {
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
}
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
    attachments: Attachment[];
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
    constructor(to: string, subject: string, html: string, attachments: Attachment[]);
    addAttachment(attachment: Attachment): this;
}
