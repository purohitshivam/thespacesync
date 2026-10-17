import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfigStatus } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const config = getSupabaseConfigStatus();
  if (!config.isConfigured) {
    return null;
  }

  return createBrowserClient(config.url, config.anonKey);
}
