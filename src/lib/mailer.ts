import "server-only";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? "587"),
      secure: Number(process.env.SMTP_PORT ?? "587") === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

// Never throws. A flaky SMTP provider should not block a delivery creation,
// status update, or chat message from being saved. Callers can inspect the
// returned boolean if they want to surface a soft warning.
export async function sendMail({ to, subject, html }: SendMailInput): Promise<boolean> {
  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
