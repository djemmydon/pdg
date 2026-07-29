import { Badge } from "@/components/ui/badge";
import { STATUS_META } from "@/lib/statuses";
import type { DeliveryStatus } from "@/lib/types";

const COLOR_CLASSES: Record<string, string> = {
  amber: "bg-amber-100 text-amber-800",
  sky: "bg-sky-100 text-sky-800",
  emerald: "bg-emerald-100 text-emerald-800",
  rose: "bg-rose-100 text-rose-800",
  slate: "bg-slate-100 text-slate-700",
  orange: "bg-brand-100 text-brand-800",
};

export function StatusBadge({ status }: { status: DeliveryStatus }) {
  const meta = STATUS_META[status];

  return (
    <Badge
      variant="outline"
      className={`h-auto rounded-md border-transparent px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${COLOR_CLASSES[meta.color]}`}
    >
      {meta.label}
    </Badge>
  );
}
