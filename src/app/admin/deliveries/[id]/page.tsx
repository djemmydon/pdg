import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { StatusUpdateForm } from "@/components/admin/StatusUpdateForm";
import { AdminChatSection } from "@/components/admin/AdminChatSection";
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-sm text-muted-foreground">{delivery.tracking_code}</p>
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              {delivery.recipient_name}
            </h1>
          </div>
          <StatusBadge status={delivery.current_status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <Detail label="Recipient email" value={delivery.recipient_email} />
                  <Detail label="Recipient phone" value={delivery.recipient_phone ?? "Not provided"} />
                  <Detail label="Item" value={delivery.item_description} />
                  <Detail label="Origin" value={delivery.origin ?? "Not provided"} />
                  <Detail label="Destination" value={delivery.destination ?? "Not provided"} />
                  {delivery.admin_note && (
                    <Detail label="Internal note" value={delivery.admin_note} />
                  )}
                </dl>
              </CardContent>
            </Card>

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
    <div>
      <dt className="text-xs font-semibold text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}
