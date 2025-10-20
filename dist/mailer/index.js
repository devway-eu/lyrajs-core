import { Transporter } from "./Transporter.js";
class Mailer {
    transporter;
    mails = [];
    constructor() {
        this.transporter = Transporter;
        return this;
    }
    async send(mail) {
        await this.transporter.sendMail(mail);
    }
    addMail(email) {
        this.mails.push(email);
        return this;
    }
    async sendBulk() {
        for (const mail of this.mails) {
            await this.transporter.sendMail(mail);
        }
        this.mails = [];
    }
}
export const mailer = new Mailer();
//# sourceMappingURL=index.js.map