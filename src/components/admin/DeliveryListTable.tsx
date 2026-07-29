"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Delivery } from "@/lib/types";

export function DeliveryListTable({ deliveries }: { deliveries: Delivery[] }) {
  const [query, setQuery] = useState("");

  const filtered = deliveries.filter((d) => {
    const haystack = `${d.tracking_code} ${d.recipient_name} ${d.recipient_email} ${d.item_description}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="border-b border-border p-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by code, name, email, or item"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tracking code</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((delivery) => (
            <TableRow key={delivery.id}>
              <TableCell>
                <Link
                  href={`/admin/deliveries/${delivery.id}`}
                  className="font-mono font-semibold text-primary hover:underline"
                >
                  {delivery.tracking_code}
                </Link>
              </TableCell>
              <TableCell>
                <p className="font-medium text-foreground">{delivery.recipient_name}</p>
                <p className="text-xs text-muted-foreground">{delivery.recipient_email}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">{delivery.item_description}</TableCell>
              <TableCell>
                <StatusBadge status={delivery.current_status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(delivery.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                No deliveries found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
