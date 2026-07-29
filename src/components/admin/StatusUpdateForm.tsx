"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_STATUSES, STATUS_META } from "@/lib/statuses";
import type { DeliveryStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StatusUpdateForm({
  deliveryId,
  currentStatus,
}: {
  deliveryId: string;
  currentStatus: DeliveryStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<DeliveryStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [holdReason, setHoldReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/admin/deliveries/${deliveryId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note, holdReason }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to update status");
      setSubmitting(false);
      return;
    }

    setNote("");
    setHoldReason("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Update status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1.5">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as DeliveryStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5">Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Shown on the recipient's timeline"
              rows={2}
            />
          </div>

          {status === "on_hold" && (
            <div>
              <Label className="mb-1.5">Hold reason (required)</Label>
              <Textarea
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder="Shown to the recipient"
                rows={2}
                required
                aria-invalid={!holdReason}
              />
            </div>
          )}

          {error && (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Updating..." : "Update status"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
