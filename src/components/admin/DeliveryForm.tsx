"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function DeliveryForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    itemDescription: "",
    origin: "",
    destination: "",
    adminNote: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "Failed to create delivery");
      setSubmitting(false);
      return;
    }

    router.push(`/admin/deliveries/${body.delivery.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Recipient</p>
            <div className="grid gap-4 rounded-md bg-muted/40 p-4 sm:grid-cols-2">
              <Field label="Recipient name" required>
                <Input
                  required
                  value={form.recipientName}
                  onChange={(e) => update("recipientName", e.target.value)}
                />
              </Field>
              <Field label="Recipient email" required>
                <Input
                  required
                  type="email"
                  value={form.recipientEmail}
                  onChange={(e) => update("recipientEmail", e.target.value)}
                />
              </Field>
              <Field label="Recipient phone">
                <Input
                  value={form.recipientPhone}
                  onChange={(e) => update("recipientPhone", e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Shipment details</p>
            <div className="grid gap-4 rounded-md bg-muted/40 p-4 sm:grid-cols-2">
              <Field label="Item description" required className="sm:col-span-2">
                <Input
                  required
                  value={form.itemDescription}
                  onChange={(e) => update("itemDescription", e.target.value)}
                  placeholder="e.g. 3x ceramic mugs"
                />
              </Field>
              <Field label="Origin">
                <Input value={form.origin} onChange={(e) => update("origin", e.target.value)} />
              </Field>
              <Field label="Destination">
                <Input
                  value={form.destination}
                  onChange={(e) => update("destination", e.target.value)}
                />
              </Field>
            </div>
          </div>

          <Field label="Internal note (not shown to the recipient)">
            <Textarea
              value={form.adminNote}
              onChange={(e) => update("adminNote", e.target.value)}
              rows={3}
            />
          </Field>

          {error && (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting} className="w-full" size="lg">
            {submitting ? "Creating..." : "Create delivery"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
