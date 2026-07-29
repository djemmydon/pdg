import type { DeliveryStatus } from "@/lib/database.types";

interface StatusMeta {
  label: string;
  description: string;
  color: "amber" | "sky" | "emerald" | "rose" | "slate" | "orange";
}

// Forward progression order, used for the timeline. on_hold and cancelled
// are interrupts, not steps, so they are excluded from this array and
// handled separately wherever the linear progress needs rendering.
export const STATUS_ORDER: DeliveryStatus[] = [
  "order_confirmed",
  "processing",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

export const STATUS_META: Record<DeliveryStatus, StatusMeta> = {
  order_confirmed: {
    label: "Order Confirmed",
    description: "Your delivery has been created and confirmed.",
    color: "slate",
  },
  processing: {
    label: "Preparing Your Delivery",
    description: "Your item is being prepared for shipment.",
    color: "amber",
  },
  shipped: {
    label: "Shipped",
    description: "Your delivery has left the origin facility.",
    color: "orange",
  },
  in_transit: {
    label: "In Transit",
    description: "Your delivery is on its way.",
    color: "sky",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    description: "Your delivery is out for final delivery today.",
    color: "sky",
  },
  delivered: {
    label: "Delivered",
    description: "Your delivery has arrived.",
    color: "emerald",
  },
  on_hold: {
    label: "On Hold",
    description: "Your delivery needs attention. Please chat with support.",
    color: "rose",
  },
  cancelled: {
    label: "Cancelled",
    description: "This delivery has been cancelled.",
    color: "slate",
  },
};

export function isInterruptStatus(status: DeliveryStatus): boolean {
  return status === "on_hold" || status === "cancelled";
}

export const ALL_STATUSES: DeliveryStatus[] = [
  ...STATUS_ORDER,
  "on_hold",
  "cancelled",
];
