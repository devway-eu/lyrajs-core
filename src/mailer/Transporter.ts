import nodemailer from "nodemailer"

import { Config } from "@/core/config"

const config = new Config().get("mailer")
const { host, port, user, pass } = config

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
  port: Number(port),
  secure: Number(port) === 465,
  auth: {
    user,
    pass
  },
  // Add timeout settings to prevent hanging
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,   // 10 seconds
  socketTimeout: 10000,     // 10 seconds
} as nodemailer.TransportOptions)

/**
 * Verify SMTP connection
 * Useful for testing configuration on startup
 */
export async function verifyMailerConnection(): Promise<boolean> {
  try {
    await Transporter.verify()
    console.log('[Mailer] ✓ SMTP connection verified successfully')
    return true
  } catch (error: any) {
    console.error('[Mailer] ✗ SMTP connection failed:', error.message)
    console.error('[Mailer] Check your mailer configuration:')
    console.error(`  - Host: ${host}`)
    console.error(`  - Port: ${port}`)
    console.error(`  - User: ${user}`)
    console.error(`  - Secure: ${Number(port) === 465}`)
    return false
  }
}

