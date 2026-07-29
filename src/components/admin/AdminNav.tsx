"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/admin">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/admin/deliveries/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            <Plus className="h-4 w-4" />
            New delivery
          </Link>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  );
}
