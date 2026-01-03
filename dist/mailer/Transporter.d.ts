import nodemailer from "nodemailer";
/**
 * Nodemailer transporter instance
 * Configured with SMTP settings from mailer.yaml configuration file
 * Automatically enables secure mode (SSL/TLS) when port 465 is used
 * @example
 * import { Transporter } from '@lyra-js/core'
 * await Transporter.sendMail({ from, to, subject, html })
 */
export declare const Transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
