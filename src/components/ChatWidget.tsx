"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatMessage, ChatSender } from "@/lib/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

interface ChatWidgetProps {
  deliveryId: string;
  senderType: ChatSender;
  initialMessages: ChatMessage[];
  // Present only for guests: a short-lived, delivery-scoped token minted by
  // the server after a successful tracking-code lookup. Admins already have
  // an authenticated Supabase session via cookies, so this is omitted.
  guestToken?: string;
  onSendMessage: (message: string) => Promise<ChatMessage>;
  onClose?: () => void;
  // Fired for every realtime message from the other party, regardless of
  // whether the widget is visually open, so a container can surface a
  // notification even while its own panel is hidden.
  onIncomingMessage?: (message: ChatMessage) => void;
  className?: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function ChatWidget({
  deliveryId,
  senderType,
  initialMessages,
  guestToken,
  onSendMessage,
  onClose,
  onIncomingMessage,
  className = "",
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabaseClient = useMemo(() => createBrowserSupabaseClient(), []);
  // The send button is disabled while a send is in flight, so at most one of
  // our own messages is ever unconfirmed at a time. Tracking it lets the
  // realtime handler recognize "this INSERT is the echo of what I just sent"
  // instead of appending it as a second, duplicate message.
  const pendingOwnMessageRef = useRef<{ tempId: string; text: string } | null>(null);
  // Kept in a ref so the subscription effect below doesn't need to
  // resubscribe every time the caller passes a new inline function.
  const onIncomingMessageRef = useRef(onIncomingMessage);
  useEffect(() => {
    onIncomingMessageRef.current = onIncomingMessage;
  });

  useEffect(() => {
    if (guestToken) {
      supabaseClient.realtime.setAuth(guestToken);
    }

    const channel = supabaseClient
      .channel(`chat-${deliveryId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `delivery_id=eq.${deliveryId}`,
        },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;

            const pending = pendingOwnMessageRef.current;
            if (pending && incoming.sender_type === senderType && incoming.message === pending.text) {
              pendingOwnMessageRef.current = null;
              return prev.map((m) => (m.id === pending.tempId ? incoming : m));
            }

            if (incoming.sender_type !== senderType) {
              onIncomingMessageRef.current?.(incoming);
            }

            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [deliveryId, supabaseClient, guestToken, senderType]);

  // Messages can arrive out of chronological order: an optimistic send is
  // appended locally before the server confirms it, and a concurrent
  // message from the other party can have its realtime event land first.
  // Sorting by timestamp on every render keeps the list stable regardless
  // of arrival order.
  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [messages]
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [sortedMessages]);

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;

    const tempId = crypto.randomUUID();
    const optimisticMessage: ChatMessage = {
      id: tempId,
      delivery_id: deliveryId,
      sender_type: senderType,
      sender_admin_id: null,
      message: text,
      created_at: new Date().toISOString(),
    };

    pendingOwnMessageRef.current = { tempId, text };
    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft("");
    setSending(true);
    try {
      const saved = await onSendMessage(text);
      // If the realtime echo already arrived and reconciled this message
      // itself, pendingOwnMessageRef is already cleared and no entry in
      // state still has tempId, so this map is a harmless no-op.
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
      if (pendingOwnMessageRef.current?.tempId === tempId) {
        pendingOwnMessageRef.current = null;
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(text);
      if (pendingOwnMessageRef.current?.tempId === tempId) {
        pendingOwnMessageRef.current = null;
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Support chat</p>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close support chat"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="min-h-60 flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
        {sortedMessages.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No messages yet. Say hello.
          </p>
        )}
        {sortedMessages.map((msg) => {
          const isOwn = msg.sender_type === senderType;
          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground"
                }`}
              >
                <p>{msg.message}</p>
                <p className={`mt-1 text-[10px] ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message"
          className="h-9 flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          size="icon"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
