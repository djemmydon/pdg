import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { StatusUpdateForm } from "@/components/admin/StatusUpdateForm";
import { AdminChatSection } from "@/components/admin/AdminChatSection";
import { DeleteDeliveryButton } from "@/components/admin/DeleteDeliveryButton";
import { DeliveryMap } from "@/components/DeliveryMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!delivery) {
    notFound();
  }

  const { data: history } = await supabase
    .from("delivery_status_history")
    .select("*")
    .eq("delivery_id", id)
    .order("created_at", { ascending: true });

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("delivery_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-sm text-muted-foreground">{delivery.tracking_code}</p>
            <h1 className="font-display truncate text-2xl font-extrabold text-foreground">
              {delivery.recipient_name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={delivery.current_status} />
            <DeleteDeliveryButton deliveryId={delivery.id} trackingCode={delivery.tracking_code} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <Detail label="Recipient email" value={delivery.recipient_email} />
                  <Detail label="Recipient phone" value={delivery.recipient_phone ?? "Not provided"} />
                  <Detail label="Item" value={delivery.item_description} />
                  <Detail label="Origin" value={delivery.origin ?? "Not provided"} />
                  <Detail label="Destination" value={delivery.destination ?? "Not provided"} />
                  <Detail
                    label="Current location"
                    value={delivery.current_location_name ?? "Not set"}
                  />
                  {delivery.admin_note && (
                    <Detail label="Internal note" value={delivery.admin_note} />
                  )}
                </dl>
              </CardContent>
            </Card>

            {(delivery.origin_lat != null ||
              delivery.destination_lat != null ||
              delivery.current_lat != null) && (
              <Card>
                <CardHeader>
                  <CardTitle>Route</CardTitle>
                </CardHeader>
                <CardContent>
                  <DeliveryMap
                    origin={{ name: delivery.origin, lat: delivery.origin_lat, lng: delivery.origin_lng }}
                    destination={{
                      name: delivery.destination,
                      lat: delivery.destination_lat,
                      lng: delivery.destination_lng,
                    }}
                    current={{
                      name: delivery.current_location_name,
                      lat: delivery.current_lat,
                      lng: delivery.current_lng,
                    }}
                  />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline history={history ?? []} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <StatusUpdateForm deliveryId={delivery.id} currentStatus={delivery.current_status} />
          </div>
        </div>
      </main>

      <AdminChatSection deliveryId={delivery.id} initialMessages={messages ?? []} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 text-foreground break-words">{value}</dd>
    </div>
  );
}
