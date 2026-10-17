import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/lib/env";
import { moderationActionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin, account_status")
    .eq("id", user.id)
    .maybeSingle();

  const adminEmails = getAdminEmails();
  const isEmailAdmin = user.email ? adminEmails.includes(user.email.toLowerCase()) : false;

  if ((!adminProfile?.is_admin && !isEmailAdmin) || adminProfile?.account_status !== "active") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required." },
      { status: 403 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = moderationActionSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid moderation action" },
      { status: 400 }
    );
  }

  const { actionType, reportId, targetUserId, notes } = parsed.data;

  if (actionType === "resolve_report" || actionType === "dismiss_report") {
    if (!reportId) {
      return NextResponse.json({ error: "reportId required" }, { status: 400 });
    }
    const newStatus =
      actionType === "resolve_report" ? "resolved_action_taken" : "dismissed";

    const { error } = await supabase
      .from("reports")
      .update({
        status: newStatus,
        moderator_notes: notes || "",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  } else if (actionType === "suspend_user" || actionType === "reactivate_user") {
    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
    }
    const newAccountStatus = actionType === "suspend_user" ? "suspended" : "active";

    const { error } = await supabase
      .from("profiles")
      .update({
        account_status: newAccountStatus,
        is_published: actionType === "suspend_user" ? false : undefined,
      })
      .eq("id", targetUserId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  // Record immutable audit log entry
  await supabase.from("moderation_audit_log").insert({
    admin_user_id: user.id,
    target_user_id: targetUserId ?? null,
    report_id: reportId ?? null,
    action_type: actionType,
    notes: notes || "",
  });

  return NextResponse.json({ success: true });
}
