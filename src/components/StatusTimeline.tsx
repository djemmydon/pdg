import { STATUS_META } from "@/lib/statuses";
import type { StatusHistoryEntry } from "@/lib/types";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function StatusTimeline({ history }: { history: StatusHistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No status updates yet.</p>;
  }

  const ordered = [...history].reverse();

  return (
    <ol className="space-y-6">
      {ordered.map((entry, index) => {
        const meta = STATUS_META[entry.status];
        const isLatest = index === 0;
        const dotColor =
          entry.status === "on_hold"
            ? "bg-destructive"
            : entry.status === "cancelled"
              ? "bg-muted-foreground"
              : isLatest
                ? "bg-primary"
                : "bg-foreground/30";

        return (
          <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index !== ordered.length - 1 && (
              <span className="absolute top-3 left-[5px] h-full w-px bg-border" />
            )}
            <span className={`relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{meta.label}</p>
              {entry.note && <p className="mt-0.5 text-sm text-muted-foreground">{entry.note}</p>}
              {entry.hold_reason && (
                <p className="mt-0.5 text-sm text-destructive">{entry.hold_reason}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{formatTimestamp(entry.created_at)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
