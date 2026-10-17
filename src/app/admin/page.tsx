import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/lib/env";
import { AdminClient } from "@/components/admin/AdminClient";
import type {
  ModerationAuditLogRow,
  ProfileRow,
  ReportRow,
  WaitlistEntryRow,
} from "@/types/database";
import { ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Admin & Moderation Dashboard",
};

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?redirectTo=/admin&reason=auth_required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("is_admin, account_status")
    .eq("id", user.id)
    .maybeSingle();

  const adminEmails = getAdminEmails();
  const isEmailAdmin = user.email ? adminEmails.includes(user.email.toLowerCase()) : false;

  if ((!viewerProfile?.is_admin && !isEmailAdmin) || viewerProfile?.account_status !== "active") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-terracotta/15 text-terracotta-dark flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl text-charcoal">Unauthorised Access</h1>
        <p className="text-sm text-muted leading-relaxed">
          This area is restricted to authorised SpaceSync administrators and moderators.
        </p>
        <Link
          href="/discover"
          className="inline-block px-6 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold"
        >
          Return to Discovery
        </Link>
      </div>
    );
  }

  // Query live counts from actual persisted PostgreSQL records (zero fabricated stats)
  const [
    { count: registeredUsers },
    { count: verifiedUsers },
    { count: completedProfiles },
    { count: publishedProfiles },
    { count: interestsCount },
    { count: mutualMatchesCount },
    { count: conversationsCount },
    { count: messagesCount },
    { count: waitlistCount },
    { count: premiumConversionsCount },
    { data: reports },
    { data: recentUsers },
    { data: waitlistEntries },
    { data: auditLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_email_verified", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("onboarding_completed", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("interests").select("id", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("conversations").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("waitlist_entries").select("id", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("tier", "premium")
      .eq("status", "active"),
    supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("waitlist_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("moderation_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
          Protected Administrator Console
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mt-1">
          SpaceSync Admin & Moderation
        </h1>
        <p className="text-sm text-muted mt-1">
          All counts below are computed in real time from persisted PostgreSQL records. Zero seeded or fabricated metrics.
        </p>
      </div>

      <AdminClient
        metrics={{
          registeredUsers: registeredUsers ?? 0,
          verifiedUsers: verifiedUsers ?? 0,
          completedProfiles: completedProfiles ?? 0,
          publishedProfiles: publishedProfiles ?? 0,
          interestsCount: interestsCount ?? 0,
          mutualMatchesCount: mutualMatchesCount ?? 0,
          conversationsCount: conversationsCount ?? 0,
          messagesCount: messagesCount ?? 0,
          waitlistCount: waitlistCount ?? 0,
          premiumConversionsCount: premiumConversionsCount ?? 0,
        }}
        reports={(reports as ReportRow[]) ?? []}
        recentUsers={(recentUsers as ProfileRow[]) ?? []}
        waitlistEntries={(waitlistEntries as WaitlistEntryRow[]) ?? []}
        auditLogs={(auditLogs as ModerationAuditLogRow[]) ?? []}
      />
    </div>
  );
}
