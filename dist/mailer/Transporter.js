import nodemailer from "nodemailer";
import { Config } from "../config/index.js";
const { host, port, user, password } = new Config().get("mailer");
export const Transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
        user,
        password
    }
});
//# sourceMappingURL=Transporter.js.map