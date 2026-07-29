import type { Database } from "./database.types";

export type Delivery = Database["public"]["Tables"]["deliveries"]["Row"];
export type StatusHistoryEntry =
  Database["public"]["Tables"]["delivery_status_history"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
export type { DeliveryStatus, ChatSender } from "./database.types";
