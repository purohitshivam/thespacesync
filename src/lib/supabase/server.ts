import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfigStatus } from "@/lib/env";

export async function createSupabaseServerClient() {
  const config = getSupabaseConfigStatus();
  if (!config.isConfigured) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          );
        } catch {
          // Ignore cookie writes inside read-only Server Components;
          // Middleware and Route Handlers handle session refresh cookie writes.
        }
      },
    },
  });
}
