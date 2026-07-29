import { emailLayout, trackingLinkButton } from "./layout";

interface DeliveryCreatedInput {
  recipientName: string;
  trackingCode: string;
  itemDescription: string;
  trackingUrl: string;
}

export function deliveryCreatedEmail({
  recipientName,
  trackingCode,
  itemDescription,
  trackingUrl,
}: DeliveryCreatedInput) {
  const html = emailLayout(`
    <p>Hi ${recipientName},</p>
    <p>A delivery has been created for you: <strong>${itemDescription}</strong>.</p>
    <p>Your tracking code is:</p>
    <p style="font-size:20px;font-weight:800;letter-spacing:2px;color:#C2410C;background:#FFF7ED;padding:12px 16px;border-radius:8px;text-align:center;">${trackingCode}</p>
    <p>Use it on our tracking page to follow your delivery's status, or just click the button below.</p>
    ${trackingLinkButton(trackingUrl)}
  `);

  return {
    subject: `Your PDG tracking code: ${trackingCode}`,
    html,
  };
}
