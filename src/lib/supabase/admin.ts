import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfigStatus } from "@/lib/env";

/**
 * Privileged Server-Only Supabase Client.
 * Used strictly on the server for:
 *  1. Complete user account deletion (`auth.admin.deleteUser`)
 *  2. Verified Razorpay payment webhook subscription updates
 * NEVER import this module into any Client Component.
 */
export function createSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("SECURITY VIOLATION: Supabase Admin Client cannot be invoked in the browser.");
  }

  const config = getSupabaseConfigStatus();
  const serviceRoleKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY
  )?.trim();

  if (!config.isConfigured || !config.hasServiceRole || !serviceRoleKey) {
    return null;
  }

  return createClient(config.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
