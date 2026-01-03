import nodemailer from "nodemailer"

import { Config } from "@/core/config"

const { host, port, user, password } = new Config().get("mailer")

/**
 * Nodemailer transporter instance
 * Configured with SMTP settings from mailer.yaml configuration file
 * Automatically enables secure mode (SSL/TLS) when port 465 is used
 * @example
 * import { Transporter } from '@lyra-js/core'
 * await Transporter.sendMail({ from, to, subject, html })
 */
export const Transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    password
  }
} as nodemailer.TransportOptions)
