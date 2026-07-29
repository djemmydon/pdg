import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyGuestToken } from "@/lib/auth/guestToken";
import { getDeliveryById, insertChatMessage } from "@/lib/deliveries";
import { sendMail } from "@/lib/mailer";
import { newChatMessageEmail } from "@/lib/emailTemplates/newChatMessage";

const schema = z.object({
  deliveryId: z.string().uuid(),
  token: z.string().min(1),
  message: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { deliveryId, token, message } = parsed.data;

  // Independent verification: this route runs with the service-role key and
  // bypasses RLS, so it must not trust the caller just because a matching
  // RLS policy also exists.
  if (!verifyGuestToken(token, deliveryId)) {
    return NextResponse.json({ error: "Invalid or expired tracking session" }, { status: 401 });
  }

  const delivery = await getDeliveryById(deliveryId);
  if (!delivery) {
    return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
  }

  const chatMessage = await insertChatMessage({
    deliveryId,
    senderType: "guest",
    message,
  });

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/deliveries/${deliveryId}`;
    const { subject, html } = newChatMessageEmail({
      recipientLabel: "there",
      trackingCode: delivery.tracking_code,
      message,
      trackingUrl,
    });
    void sendMail({ to: adminEmail, subject, html });
  }

  return NextResponse.json({ message: chatMessage });
}
