import React from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/SettingsClient";
import type { PrivacyPreferencesRow } from "@/types/database";

export const metadata = {
  title: "Account Settings & Privacy",
};

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?redirectTo=/settings&reason=auth_required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/settings");
  }

  const [{ data: profile }, { data: privacy }, { data: blockRows }] =
    await Promise.all([
      supabase.from("profiles").select("is_published").eq("id", user.id).maybeSingle(),
      supabase.from("privacy_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("user_blocks")
        .select("blocked_id, created_at")
        .eq("blocker_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  const blockedIds = (blockRows ?? []).map((b) => b.blocked_id);
  const nameMap = new Map<string, string>();
  if (blockedIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, first_name")
      .in("id", blockedIds);
    for (const p of profs ?? []) {
      nameMap.set(p.id, p.first_name || "User");
    }
  }

  const blockedUsers = (blockRows ?? []).map((b) => ({
    blockedUserId: b.blocked_id,
    firstName: nameMap.get(b.blocked_id) ?? "Blocked User",
    createdAt: b.created_at,
  }));

  const defaultPrivacy: PrivacyPreferencesRow = privacy ?? {
    user_id: user.id,
    discoverable_in_search: true,
    show_institution_or_company: true,
    show_exact_neighborhoods: true,
    share_contact_with_matches: false,
    contact_phone_or_handle: "",
    notify_new_interests: true,
    notify_mutual_matches: true,
    notify_messages: true,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Privacy, Safety & Account Control
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mt-1">
          Account Settings
        </h1>
        <p className="text-sm text-muted mt-1">
          Manage your discovery visibility, private contact sharing, notifications, blocked users, and account deletion.
        </p>
      </div>

      <SettingsClient
        initialPrivacy={defaultPrivacy}
        isPublished={Boolean(profile?.is_published)}
        blockedUsers={blockedUsers}
      />
    </div>
  );
}
