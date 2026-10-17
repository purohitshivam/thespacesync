import React from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";
import type { NotificationRow } from "@/types/database";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?redirectTo=/notifications&reason=auth_required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/notifications");
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Activity & Alerts
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mt-1">
          Notifications
        </h1>
        <p className="text-sm text-muted mt-1">
          Persistent alerts for received interests, mutual matches, and new messages.
        </p>
      </div>

      <NotificationsClient
        initialNotifications={(notifications as NotificationRow[]) ?? []}
      />
    </div>
  );
}
