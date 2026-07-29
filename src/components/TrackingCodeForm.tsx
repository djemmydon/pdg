"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TrackingCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/track/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const body = await res.json();

      if (!res.ok || !body.valid) {
        setError("We could not find a delivery with that code. Please check it and try again.");
        setLoading(false);
        return;
      }

      router.push(`/track/${encodeURIComponent(trimmed.toUpperCase())}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <Label htmlFor="tracking-code" className="mb-1.5 text-sm font-semibold text-foreground">
          Enter your tracking number
        </Label>
        <Input
          id="tracking-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. PDG-4F7XQK2M"
          className="h-12 border-border bg-background text-base uppercase shadow-sm"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={loading || !code.trim()}
        className="h-12 w-full text-base"
      >
        {loading ? "Checking..." : "Track shipment"}
      </Button>
      {error && (
        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
