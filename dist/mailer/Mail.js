import { Config } from "../config/index.js";
const mailFrom = new Config().get("mailer.sender");
export class Mail {
    from;
    to;
    subject;
    html;
    constructor(to, subject, html) {
        this.from = mailFrom;
        this.to = to;
        this.subject = subject;
        this.html = html;
    }
}
//# sourceMappingURL=Mail.js.map