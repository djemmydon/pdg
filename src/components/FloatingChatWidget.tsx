"use client";

import { useEffect } from "react";
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
  // On mobile the panel takes over the full screen, so lock background
  // scroll while it's open (matches how a full-screen modal should behave).
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Launcher button: fixed corner on every screen size, but hidden on
          mobile while the panel is open since it covers the full screen and
          the panel's own close button takes over. */}
      <div
        className={`fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6 ${
          open ? "hidden sm:block" : ""
        }`}
      >
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

      {/* Stays mounted while closed so the realtime subscription and message
          history survive toggling, instead of resetting to a stale snapshot
          every time the widget is reopened. Full screen below the `sm`
          breakpoint, a floating card above it. */}
      <div
        className={`fixed inset-0 z-50 duration-150 sm:inset-auto sm:right-6 sm:bottom-24 sm:w-[min(22rem,calc(100vw-2rem))] ${
          open ? "animate-in fade-in flex sm:slide-in-from-bottom-4" : "hidden"
        }`}
      >
        <ChatWidget
          deliveryId={deliveryId}
          senderType={senderType}
          initialMessages={initialMessages}
          guestToken={guestToken}
          onSendMessage={onSendMessage}
          onClose={() => onOpenChange(false)}
          className="h-dvh w-full rounded-none border-0 sm:h-[calc(100vh-8rem)] sm:rounded-lg sm:border sm:shadow-lg"
        />
      </div>
    </>
  );
}
