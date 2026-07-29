import { AdminNav } from "@/components/admin/AdminNav";
import { DeliveryListTable } from "@/components/admin/DeliveryListTable";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 font-display text-2xl font-extrabold text-foreground">
          Deliveries
        </h1>
        <DeliveryListTable deliveries={deliveries ?? []} />
      </main>
    </div>
  );
}
