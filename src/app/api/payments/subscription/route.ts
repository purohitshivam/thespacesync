import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

  let body: { action?: "cancel" | "resume" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action !== "cancel" && body.action !== "resume") {
    return NextResponse.json({ error: "Invalid subscription action" }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is required on the server to modify subscription renewal state.",
      },
      { status: 503 }
    );
  }

  const cancelAtPeriodEnd = body.action === "cancel";
  const { error } = await adminClient
    .from("subscriptions")
    .update({ cancel_at_period_end: cancelAtPeriodEnd })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    updated: true,
    cancelAtPeriodEnd,
    message: cancelAtPeriodEnd
      ? "Your subscription will remain active until the end of the current billing period and will not auto-renew."
      : "Monthly subscription renewal has been resumed.",
  });
}
