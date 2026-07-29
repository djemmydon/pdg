"use client";

import { useState } from "react";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import type { ChatMessage } from "@/lib/types";

export function AdminChatSection({
  deliveryId,
  initialMessages,
}: {
  deliveryId: string;
  initialMessages: ChatMessage[];
}) {
  const [open, setOpen] = useState(false);

  async function handleSend(message: string) {
    const res = await fetch(`/api/admin/deliveries/${deliveryId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      throw new Error("Failed to send message");
    }
    const body = await res.json();
    return body.message as ChatMessage;
  }

  return (
    <FloatingChatWidget
      deliveryId={deliveryId}
      senderType="admin"
      initialMessages={initialMessages}
      onSendMessage={handleSend}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
