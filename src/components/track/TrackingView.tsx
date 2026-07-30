"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { HoldBanner } from "@/components/HoldBanner";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { DeliveryMap } from "@/components/DeliveryMap";
import { Separator } from "@/components/ui/separator";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { ChatMessage, Delivery, StatusHistoryEntry } from "@/lib/types";

interface TrackingViewProps {
  delivery: Delivery;
  initialHistory: StatusHistoryEntry[];
  initialMessages: ChatMessage[];
  guestToken: string;
}

export function TrackingView({
  delivery: initialDelivery,
  initialHistory,
  initialMessages,
  guestToken,
}: TrackingViewProps) {
  const [delivery, setDelivery] = useState(initialDelivery);
  const [history, setHistory] = useState(initialHistory);
  const [chatOpen, setChatOpen] = useState(false);
  const supabaseClient = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    supabaseClient.realtime.setAuth(guestToken);

    const channel = supabaseClient
      .channel(`tracking-${delivery.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "deliveries",
          filter: `id=eq.${delivery.id}`,
        },
        (payload) => setDelivery(payload.new as Delivery)
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_status_history",
          filter: `delivery_id=eq.${delivery.id}`,
        },
        (payload) => {
          const incoming = payload.new as StatusHistoryEntry;
          setHistory((prev) => (prev.some((h) => h.id === incoming.id) ? prev : [...prev, incoming]));
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [delivery.id, guestToken, supabaseClient]);

  async function handleSendMessage(message: string) {
    const res = await fetch("/api/track/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryId: delivery.id, token: guestToken, message }),
    });
    if (!res.ok) {
      throw new Error("Failed to send message");
    }
    const body = await res.json();
    return body.message as ChatMessage;
  }

  const onHold = delivery.current_status === "on_hold";

  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <header className="flex items-center border-b border-border bg-background px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {onHold && (
          <div className="mb-6">
            <HoldBanner holdReason={delivery.hold_reason} onChatClick={() => setChatOpen(true)} />
          </div>
        )}

        <div className="grid gap-6 rounded-lg border border-border bg-background p-6 sm:grid-cols-[220px_1fr] sm:p-8">
          <div className="space-y-5 sm:border-r sm:border-border sm:pr-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Recipient
              </p>
              <p className="mt-1 font-medium text-foreground">{delivery.recipient_name}</p>
            </div>
            {(delivery.origin || delivery.destination) && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Route
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {delivery.origin ?? "Not provided"}{" "}
                  <span className="text-muted-foreground">to</span>{" "}
                  {delivery.destination ?? "Not provided"}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Item
              </p>
              <p className="mt-1 text-sm text-foreground">{delivery.item_description}</p>
            </div>
            {delivery.current_location_name && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Current location
                </p>
                <p className="mt-1 text-sm text-foreground">{delivery.current_location_name}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Tracking No.
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground">
              {delivery.tracking_code}
            </p>
            <div className="mt-4">
              <StatusBadge status={delivery.current_status} />
            </div>

            <Separator className="my-6" />

            <p className="mb-4 text-sm font-semibold text-foreground">Tracking history</p>
            <StatusTimeline history={history} />
          </div>
        </div>

        {(delivery.origin_lat != null ||
          delivery.destination_lat != null ||
          delivery.current_lat != null) && (
          <div className="mt-6 rounded-lg border border-border bg-background p-6 sm:p-8">
            <p className="mb-4 text-sm font-semibold text-foreground">Route</p>
            <DeliveryMap
              origin={{
                name: delivery.origin,
                lat: delivery.origin_lat,
                lng: delivery.origin_lng,
              }}
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
          </div>
        )}
      </main>

      <FloatingChatWidget
        deliveryId={delivery.id}
        senderType="guest"
        initialMessages={initialMessages}
        guestToken={guestToken}
        onSendMessage={handleSendMessage}
        open={chatOpen}
        onOpenChange={setChatOpen}
        needsAttention={onHold}
      />
    </div>
  );
}
