export type DeliveryStatus =
  | "order_confirmed"
  | "processing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "on_hold"
  | "cancelled";

export type ChatSender = "admin" | "guest";

export interface Database {
  public: {
    Tables: {
      deliveries: {
        Row: {
          id: string;
          tracking_code: string;
          recipient_name: string;
          recipient_email: string;
          recipient_phone: string | null;
          item_description: string;
          origin: string | null;
          destination: string | null;
          current_status: DeliveryStatus;
          hold_reason: string | null;
          admin_note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tracking_code: string;
          recipient_name: string;
          recipient_email: string;
          recipient_phone?: string | null;
          item_description: string;
          origin?: string | null;
          destination?: string | null;
          current_status?: DeliveryStatus;
          hold_reason?: string | null;
          admin_note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deliveries"]["Insert"]>;
        Relationships: [];
      };
      delivery_status_history: {
        Row: {
          id: string;
          delivery_id: string;
          status: DeliveryStatus;
          note: string | null;
          hold_reason: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          delivery_id: string;
          status: DeliveryStatus;
          note?: string | null;
          hold_reason?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["delivery_status_history"]["Insert"]
        >;
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          delivery_id: string;
          sender_type: ChatSender;
          sender_admin_id: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          delivery_id: string;
          sender_type: ChatSender;
          sender_admin_id?: string | null;
          message: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      delivery_status: DeliveryStatus;
      chat_sender: ChatSender;
    };
    CompositeTypes: Record<string, never>;
  };
}
