import { emailLayout, trackingLinkButton } from "./layout";

interface OnHoldInput {
  recipientName: string;
  trackingCode: string;
  holdReason: string | null;
  trackingUrl: string;
}

export function onHoldEmail({
  recipientName,
  trackingCode,
  holdReason,
  trackingUrl,
}: OnHoldInput) {
  const html = emailLayout(`
    <p>Hi ${recipientName},</p>
    <p style="color:#BE123C;font-weight:700;">Your delivery ${trackingCode} needs your attention.</p>
    ${holdReason ? `<p>${holdReason}</p>` : ""}
    <p>Please open the tracking page and chat with our support team to resolve this.</p>
    ${trackingLinkButton(trackingUrl, "Chat With Support")}
  `);

  return {
    subject: `Action needed: your delivery ${trackingCode} is on hold`,
    html,
  };
}
