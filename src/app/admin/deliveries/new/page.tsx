import { AdminNav } from "@/components/admin/AdminNav";
import { DeliveryForm } from "@/components/admin/DeliveryForm";

export default function NewDeliveryPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 font-display text-2xl font-extrabold text-foreground">
          New delivery
        </h1>
        <DeliveryForm />
      </main>
    </div>
  );
}
