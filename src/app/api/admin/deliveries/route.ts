import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createDelivery } from "@/lib/deliveries";
import { sendMail } from "@/lib/mailer";
import { deliveryCreatedEmail } from "@/lib/emailTemplates/deliveryCreated";

const schema = z.object({
  recipientName: z.string().min(1).max(200),
  recipientEmail: z.string().email(),
  recipientPhone: z.string().max(50).optional(),
  itemDescription: z.string().min(1).max(500),
  origin: z.string().max(200).optional(),
  destination: z.string().max(200).optional(),
  originLat: z.number().min(-90).max(90).optional(),
  originLng: z.number().min(-180).max(180).optional(),
  destinationLat: z.number().min(-90).max(90).optional(),
  destinationLng: z.number().min(-180).max(180).optional(),
  adminNote: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const delivery = await createDelivery({
    recipientName: parsed.data.recipientName,
    recipientEmail: parsed.data.recipientEmail,
    recipientPhone: parsed.data.recipientPhone || null,
    itemDescription: parsed.data.itemDescription,
    origin: parsed.data.origin || null,
    destination: parsed.data.destination || null,
    originLat: parsed.data.originLat ?? null,
    originLng: parsed.data.originLng ?? null,
    destinationLat: parsed.data.destinationLat ?? null,
    destinationLng: parsed.data.destinationLng ?? null,
    adminNote: parsed.data.adminNote || null,
    createdBy: adminId,
  });

  const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track/${delivery.tracking_code}`;
  const { subject, html } = deliveryCreatedEmail({
    recipientName: delivery.recipient_name,
    trackingCode: delivery.tracking_code,
    itemDescription: delivery.item_description,
    trackingUrl,
  });
  void sendMail({ to: delivery.recipient_email, subject, html });

  return NextResponse.json({ delivery });
}
