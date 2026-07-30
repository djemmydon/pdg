"use client";

import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWidget } from "@/components/ChatWidget";
import type { ChatMessage, ChatSender } from "@/lib/types";

interface FloatingChatWidgetProps {
  deliveryId: string;
  senderType: ChatSender;
  initialMessages: ChatMessage[];
  // Present only for guests: a short-lived, delivery-scoped token minted by
  // the server after a successful tracking-code lookup. Admins already have
  // an authenticated Supabase session via cookies, so this is omitted.
  guestToken?: string;
  onSendMessage: (message: string) => Promise<ChatMessage>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  needsAttention?: boolean;
}

export function FloatingChatWidget({
  deliveryId,
  senderType,
  initialMessages,
  guestToken,
  onSendMessage,
  open,
  onOpenChange,
  needsAttention = false,
}: FloatingChatWidgetProps) {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {/* Stays mounted while closed so the realtime subscription and message
          history survive toggling, instead of resetting to a stale snapshot
          every time the widget is reopened. */}
      <div
        className={`w-[min(22rem,calc(100vw-2rem))] duration-150 ${
          open ? "animate-in fade-in slide-in-from-bottom-4 flex" : "hidden"
        }`}
      >
        <ChatWidget
          deliveryId={deliveryId}
          senderType={senderType}
          initialMessages={initialMessages}
          guestToken={guestToken}
          onSendMessage={onSendMessage}
          className="h-[calc(100vh-8rem)] w-full shadow-lg"
        />
      </div>

      <Button
        type="button"
        size="icon-lg"
        className="relative h-14 w-14 rounded-full shadow-lg"
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Close support chat" : "Open support chat"}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        {!open && needsAttention && (
          <span className="absolute top-0 right-0 flex size-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex size-3 rounded-full bg-destructive" />
          </span>
        )}
      </Button>
    </div>
  );
}
