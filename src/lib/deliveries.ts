import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { generateTrackingCode } from "@/lib/trackingCode";
import type { ChatSender, Delivery, DeliveryStatus } from "@/lib/types";

export async function getDeliveryByTrackingCode(
  trackingCode: string
): Promise<Delivery | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("deliveries")
    .select("*")
    .eq("tracking_code", trackingCode.trim().toUpperCase())
    .maybeSingle();

  return data;
}

export async function getDeliveryById(id: string): Promise<Delivery | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase.from("deliveries").select("*").eq("id", id).maybeSingle();
  return data;
}

// Status history and chat messages cascade-delete via their foreign keys
// (see migration 0001_init.sql).
export async function deleteDelivery(id: string): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("deliveries").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function getStatusHistory(deliveryId: string) {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("delivery_status_history")
    .select("*")
    .eq("delivery_id", deliveryId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function getChatMessages(deliveryId: string) {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("delivery_id", deliveryId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

interface CreateDeliveryInput {
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string | null;
  itemDescription: string;
  origin?: string | null;
  destination?: string | null;
  originLat?: number | null;
  originLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
  adminNote?: string | null;
  createdBy: string;
}

export async function createDelivery(input: CreateDeliveryInput): Promise<Delivery> {
  const supabase = createServiceRoleClient();

  // Tracking codes are unique; retry on the rare collision instead of
  // failing the request.
  for (let attempt = 0; attempt < 5; attempt++) {
    const trackingCode = generateTrackingCode();

    const { data, error } = await supabase
      .from("deliveries")
      .insert({
        tracking_code: trackingCode,
        recipient_name: input.recipientName,
        recipient_email: input.recipientEmail,
        recipient_phone: input.recipientPhone ?? null,
        item_description: input.itemDescription,
        origin: input.origin ?? null,
        destination: input.destination ?? null,
        origin_lat: input.originLat ?? null,
        origin_lng: input.originLng ?? null,
        destination_lat: input.destinationLat ?? null,
        destination_lng: input.destinationLng ?? null,
        admin_note: input.adminNote ?? null,
        current_status: "order_confirmed",
        created_by: input.createdBy,
      })
      .select("*")
      .single();

    if (!error && data) {
      await supabase.from("delivery_status_history").insert({
        delivery_id: data.id,
        status: "order_confirmed",
        note: "Delivery created.",
        created_by: input.createdBy,
      });
      return data;
    }

    // 23505 = unique_violation. Any other error should not be retried.
    if (error?.code !== "23505") {
      throw new Error(error?.message ?? "Failed to create delivery");
    }
  }

  throw new Error("Could not generate a unique tracking code, please try again");
}

interface UpdateStatusInput {
  deliveryId: string;
  status: DeliveryStatus;
  note?: string | null;
  holdReason?: string | null;
  locationName?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  updatedBy: string;
}

export async function updateDeliveryStatus(input: UpdateStatusInput): Promise<Delivery> {
  const supabase = createServiceRoleClient();
  const holdReason = input.status === "on_hold" ? input.holdReason ?? null : null;
  const hasLocation = input.locationLat != null && input.locationLng != null;

  const { data, error } = await supabase
    .from("deliveries")
    .update({
      current_status: input.status,
      hold_reason: holdReason,
      // Only overwrite the last-known location when a new one is provided;
      // a status update without one leaves the previous location in place.
      ...(hasLocation
        ? {
            current_location_name: input.locationName ?? null,
            current_lat: input.locationLat,
            current_lng: input.locationLng,
          }
        : {}),
    })
    .eq("id", input.deliveryId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update delivery status");
  }

  await supabase.from("delivery_status_history").insert({
    delivery_id: input.deliveryId,
    status: input.status,
    note: input.note ?? null,
    hold_reason: holdReason,
    location_name: hasLocation ? input.locationName ?? null : null,
    location_lat: hasLocation ? input.locationLat : null,
    location_lng: hasLocation ? input.locationLng : null,
    created_by: input.updatedBy,
  });

  return data;
}

interface SendMessageInput {
  deliveryId: string;
  senderType: ChatSender;
  message: string;
  senderAdminId?: string | null;
}

export async function insertChatMessage(input: SendMessageInput) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      delivery_id: input.deliveryId,
      sender_type: input.senderType,
      sender_admin_id: input.senderAdminId ?? null,
      message: input.message,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to send message");
  }

  return data;
}
