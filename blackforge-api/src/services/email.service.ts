import nodemailer, { type Transporter } from "nodemailer";
import { config } from "@/config";
import { logger } from "@/utils/logger";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!config.email.enabled) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport(config.email.smtpUrl!);
  }
  return transporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email. When SMTP isn't configured (dev/test), the message is logged
 * instead of sent so flows remain testable without a mail server.
 */
export async function sendEmail(msg: MailMessage): Promise<void> {
  const tx = getTransporter();
  if (!tx) {
    logger.info({ to: msg.to, subject: msg.subject }, "[email:dev] not sent (SMTP disabled)");
    logger.debug({ html: msg.html }, "[email:dev] body");
    return;
  }
  await tx.sendMail({ from: config.email.from, ...msg });
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${config.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: "Verify your BLACKFORGE account",
    text: `Confirm your email: ${link}`,
    html: `<p>Welcome to BLACKFORGE. Confirm your email:</p><p><a href="${link}">${link}</a></p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${config.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to,
    subject: "Reset your BLACKFORGE password",
    text: `Reset your password: ${link}`,
    html: `<p>Reset your password (expires in 1 hour):</p><p><a href="${link}">${link}</a></p>`,
  });
}
