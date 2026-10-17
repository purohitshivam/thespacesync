import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reportUserSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/security/rate-limit";

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

  const rl = checkRateLimit({
    key: `report:${user.id}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many reports submitted. Please wait ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reportUserSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid report payload" },
      { status: 400 }
    );
  }

  if (parsed.data.reportedUserId === user.id) {
    return NextResponse.json({ error: "You cannot report yourself." }, { status: 400 });
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: parsed.data.reportedUserId,
    conversation_id: parsed.data.conversationId ?? null,
    reason: parsed.data.reason,
    description: parsed.data.description || "",
    status: "open",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ reported: true });
}
