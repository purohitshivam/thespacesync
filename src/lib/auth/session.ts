import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/lib/env";
import type { NavbarUser } from "@/components/layout/Navbar";

export async function getCurrentNavbarUser(): Promise<NavbarUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const [{ data: profile }, { count: unreadCount }] = await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, is_admin, account_status")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false),
    ]);

    const adminEmails = getAdminEmails();
    const isEmailAdmin = user.email ? adminEmails.includes(user.email.toLowerCase()) : false;

    return {
      id: user.id,
      email: user.email,
      firstName: profile?.first_name || user.user_metadata?.first_name || "",
      isAdmin: Boolean(profile?.is_admin || isEmailAdmin),
      unreadNotificationsCount: unreadCount ?? 0,
    };
  } catch {
    return null;
  }
}
