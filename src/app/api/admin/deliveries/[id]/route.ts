import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { deleteDelivery, getDeliveryById } from "@/lib/deliveries";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const delivery = await getDeliveryById(id);
  if (!delivery) {
    return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
  }

  await deleteDelivery(id);

  return NextResponse.json({ success: true });
}
