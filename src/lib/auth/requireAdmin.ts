import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Any authenticated Supabase session is treated as an admin session, since
// public sign-up is disabled and the single admin account is the only user
// that can ever exist. Returns the user id, or null if unauthenticated.
export async function requireAdmin(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}
