"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteDeliveryButton({
  deliveryId,
  trackingCode,
}: {
  deliveryId: string;
  trackingCode: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const res = await fetch(`/api/admin/deliveries/${deliveryId}`, { method: "DELETE" });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete delivery");
      setDeleting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" className="gap-1.5" />}>
        <Trash2 className="h-4 w-4" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete delivery {trackingCode}?</DialogTitle>
          <DialogDescription>
            This permanently deletes the delivery, its status history, and its chat messages. The
            recipient will no longer be able to track it. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={deleting} />}>
            Cancel
          </DialogClose>
          <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Deleting..." : "Delete delivery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
