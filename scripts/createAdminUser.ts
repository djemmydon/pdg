// One-off script to create the single PDG admin account.
// Run with: npm run create-admin
// Requires SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local.
// Before running this, disable "Allow new users to sign up" in Supabase Auth settings,
// since the app treats any authenticated session as an admin session.
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !adminEmail || !adminPassword) {
  console.error(
    "Missing one of NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (error) {
    console.error("Failed to create admin user:", error.message);
    process.exit(1);
  }

  console.log("Admin user created:", data.user?.email, data.user?.id);
}

main();
