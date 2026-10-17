import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { expressInterestSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase database is not configured in this environment." },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rl = checkRateLimit({
    key: `interest:${user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  let rawBody: Record<string, unknown>;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = expressInterestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid interest request" },
      { status: 400 }
    );
  }

  if (parsed.data.targetUserId === user.id) {
    return NextResponse.json(
      { error: "You cannot express interest in your own profile." },
      { status: 400 }
    );
  }

  const peaceScoreSnapshot =
    typeof rawBody.peaceScore === "number" &&
    rawBody.peaceScore >= 0 &&
    rawBody.peaceScore <= 100
      ? Math.round(rawBody.peaceScore)
      : null;

  // Execute atomic PostgreSQL transaction RPC for interest & mutual match creation
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "express_interest_transaction",
    {
      p_target_user_id: parsed.data.targetUserId,
      p_action: parsed.data.action,
      p_intro_note: parsed.data.introNote || "",
      p_peace_score: peaceScoreSnapshot,
    }
  );

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 400 });
  }

  return NextResponse.json(rpcResult);
}
