import { emailLayout, trackingLinkButton } from "./layout";

interface NewChatMessageInput {
  recipientLabel: string;
  trackingCode: string;
  message: string;
  trackingUrl: string;
}

export function newChatMessageEmail({
  recipientLabel,
  trackingCode,
  message,
  trackingUrl,
}: NewChatMessageInput) {
  const html = emailLayout(`
    <p>Hi ${recipientLabel},</p>
    <p>You have a new message about delivery <strong>${trackingCode}</strong>:</p>
    <p style="background:#F1F5F9;padding:12px 16px;border-radius:8px;font-style:italic;">${message}</p>
    ${trackingLinkButton(trackingUrl, "Open Chat")}
  `);

  return {
    subject: `New message about your delivery ${trackingCode}`,
    html,
  };
}
