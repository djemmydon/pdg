import { NextResponse } from "next/server";
import { z } from "zod";
import { getDeliveryByTrackingCode } from "@/lib/deliveries";

const schema = z.object({ code: z.string().min(1).max(64) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const delivery = await getDeliveryByTrackingCode(parsed.data.code);
  return NextResponse.json({ valid: Boolean(delivery) });
}
