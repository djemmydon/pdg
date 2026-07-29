"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatMessage, ChatSender } from "@/lib/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

interface ChatWidgetProps {
  deliveryId: string;
  senderType: ChatSender;
  initialMessages: ChatMessage[];
  // Present only for guests: a short-lived, delivery-scoped token minted by
  // the server after a successful tracking-code lookup. Admins already have
  // an authenticated Supabase session via cookies, so this is omitted.
  guestToken?: string;
  onSendMessage: (message: string) => Promise<ChatMessage>;
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
  className = "",
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabaseClient = useMemo(() => createBrowserSupabaseClient(), []);

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
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [deliveryId, supabaseClient, guestToken]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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

    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft("");
    setSending(true);
    try {
      const saved = await onSendMessage(text);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-lg border border-border bg-card ${className}`}>
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">Support chat</p>
      </div>

      <div ref={scrollRef} className="min-h-60 flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No messages yet. Say hello.
          </p>
        )}
        {messages.map((msg) => {
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
