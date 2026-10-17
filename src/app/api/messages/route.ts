import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendMessageSchema } from "@/lib/validations";
import { verifyConversationAccess } from "@/lib/matching/rules";
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
    key: `message_send:${user.id}`,
    limit: 40,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Sending too quickly. Please wait ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = sendMessageSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid message" },
      { status: 400 }
    );
  }

  const { conversationId, body } = parsed.data;

  // Verify conversation participant, match status, account status, and blocks on the server
  const [{ data: actorProfile }, { data: conv }] = await Promise.all([
    supabase.from("profiles").select("account_status").eq("id", user.id).maybeSingle(),
    supabase
      .from("conversations")
      .select("id, match_id, user_one_id, user_two_id")
      .eq("id", conversationId)
      .maybeSingle(),
  ]);

  if (!conv) {
    return NextResponse.json({ error: "Conversation not found or unauthorised" }, { status: 404 });
  }

  const otherUserId = conv.user_one_id === user.id ? conv.user_two_id : conv.user_one_id;

  const [{ data: matchRow }, { data: blockRow }] = await Promise.all([
    supabase.from("matches").select("status").eq("id", conv.match_id).maybeSingle(),
    supabase
      .from("user_blocks")
      .select("id")
      .or(
        `and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`
      )
      .maybeSingle(),
  ]);

  const access = verifyConversationAccess({
    actorUserId: user.id,
    actorAccountStatus: actorProfile?.account_status ?? "active",
    conversationUserOneId: conv.user_one_id,
    conversationUserTwoId: conv.user_two_id,
    matchStatus: matchRow?.status ?? "inactive",
    isBlockedBetween: Boolean(blockRow),
  });

  if (!access.allowed) {
    return NextResponse.json(
      { error: access.reason || "Unauthorised" },
      { status: access.httpStatus ?? 403 }
    );
  }

  // Persist message to PostgreSQL BEFORE returning delivery confirmation
  const { data: savedMessage, error: insertError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body,
    })
    .select("*")
    .single();

  if (insertError || !savedMessage) {
    return NextResponse.json(
      { error: insertError?.message || "Failed to persist message to database" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: savedMessage });
}

export async function PATCH(request: Request) {
  // Mark unread messages from the other participant as read
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

  let body: { conversationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", body.conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ markedRead: true });
}
