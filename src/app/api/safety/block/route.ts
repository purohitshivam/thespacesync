import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { blockUserSchema } from "@/lib/validations";
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
    key: `block:${user.id}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = blockUserSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid block request" },
      { status: 400 }
    );
  }

  if (parsed.data.blockedUserId === user.id) {
    return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("block_user_transaction", {
    p_blocked_user_id: parsed.data.blockedUserId,
    p_reason: parsed.data.reason || "",
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 400 });
  }

  return NextResponse.json(rpcData ?? { blocked: true });
}

export async function DELETE(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const blockedUserId = searchParams.get("blockedUserId");
  if (!blockedUserId) {
    return NextResponse.json({ error: "blockedUserId required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", blockedUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ unblocked: true });
}
