import { Mail } from "./Mail"
import { Transporter } from "./Transporter"

class Mailer {
  protected transporter
  protected mails: Mail[] = []

  constructor() {
    this.transporter = Transporter
    return this
  }

  public async send(mail: Mail) {
    await this.transporter.sendMail(mail)
  }

  public addMail(email: Mail) {
    this.mails.push(email)
    return this
  }

  public async sendBulk() {
    for (const mail of this.mails) {
      await this.transporter.sendMail(mail)
    }
    this.mails = []
  }
}

export const mailer = new Mailer()
