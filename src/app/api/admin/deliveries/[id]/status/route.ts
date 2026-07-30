import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { updateDeliveryStatus } from "@/lib/deliveries";
import { sendMail } from "@/lib/mailer";
import { onHoldEmail } from "@/lib/emailTemplates/onHold";

const schema = z.object({
  status: z.enum([
    "order_confirmed",
    "processing",
    "shipped",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "on_hold",
    "cancelled",
  ]),
  note: z.string().max(1000).optional(),
  holdReason: z.string().max(1000).optional(),
  locationName: z.string().max(200).optional(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
});

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

  if (parsed.data.status === "on_hold" && !parsed.data.holdReason?.trim()) {
    return NextResponse.json({ error: "A hold reason is required" }, { status: 400 });
  }

  const delivery = await updateDeliveryStatus({
    deliveryId: id,
    status: parsed.data.status,
    note: parsed.data.note || null,
    holdReason: parsed.data.holdReason || null,
    locationName: parsed.data.locationName || null,
    locationLat: parsed.data.locationLat ?? null,
    locationLng: parsed.data.locationLng ?? null,
    updatedBy: adminId,
  });

  if (delivery.current_status === "on_hold") {
    const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track/${delivery.tracking_code}`;
    const { subject, html } = onHoldEmail({
      recipientName: delivery.recipient_name,
      trackingCode: delivery.tracking_code,
      holdReason: delivery.hold_reason,
      trackingUrl,
    });
    void sendMail({ to: delivery.recipient_email, subject, html });
  }

  return NextResponse.json({ delivery });
}
