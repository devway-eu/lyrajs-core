import { Config } from "@/core/config"

const mailFrom = new Config().get("mailer.sender")

export class Mail {
  public from: string
  public to: string
  public subject: string
  public html: string

  constructor(to: string, subject: string, html: string) {
    this.from = mailFrom
    this.to = to
    this.subject = subject
    this.html = html
  }
}
