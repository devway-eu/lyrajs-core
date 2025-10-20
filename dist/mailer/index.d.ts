import { Mail } from "./Mail.js";
declare class Mailer {
    protected transporter: import("nodemailer").Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
    protected mails: Mail[];
    constructor();
    send(mail: Mail): Promise<void>;
    addMail(email: Mail): this;
    sendBulk(): Promise<void>;
}
export declare const mailer: Mailer;
export {};
