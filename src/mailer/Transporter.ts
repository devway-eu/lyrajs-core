import nodemailer from "nodemailer"

import { Config } from "@/core/config"

const { host, port, user, password } = new Config().get("mailer")

export const Transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    password
  }
} as nodemailer.TransportOptions)
