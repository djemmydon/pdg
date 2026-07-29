import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getDeliveryById, insertChatMessage } from "@/lib/deliveries";
import { sendMail } from "@/lib/mailer";
import { newChatMessageEmail } from "@/lib/emailTemplates/newChatMessage";

const schema = z.object({ message: z.string().min(1).max(2000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const delivery = await getDeliveryById(id);
  if (!delivery) {
    return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
  }

  const chatMessage = await insertChatMessage({
    deliveryId: id,
    senderType: "admin",
    senderAdminId: adminId,
    message: parsed.data.message,
  });

  const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track/${delivery.tracking_code}`;
  const { subject, html } = newChatMessageEmail({
    recipientLabel: delivery.recipient_name,
    trackingCode: delivery.tracking_code,
    message: parsed.data.message,
    trackingUrl,
  });
  void sendMail({ to: delivery.recipient_email, subject, html });

  return NextResponse.json({ message: chatMessage });
}
