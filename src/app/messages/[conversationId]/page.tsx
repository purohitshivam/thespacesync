import React from "react";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyConversationAccess } from "@/lib/matching/rules";
import { ChatRoomClient } from "@/components/messages/ChatRoomClient";
import type { MessageRow } from "@/types/database";

export default async function ConversationRoomPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(`/login?redirectTo=/messages/${conversationId}&reason=auth_required`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/messages/${conversationId}`);
  }

  const [{ data: actorProfile }, { data: conv }] = await Promise.all([
    supabase.from("profiles").select("account_status").eq("id", user.id).maybeSingle(),
    supabase.from("conversations").select("*").eq("id", conversationId).maybeSingle(),
  ]);

  if (!conv) {
    notFound();
  }

  const otherUserId =
    conv.user_one_id === user.id ? conv.user_two_id : conv.user_one_id;

  const [{ data: matchRow }, { data: blockRow }, { data: otherProfile }, { data: messages }] =
    await Promise.all([
      supabase
        .from("matches")
        .select("status, peace_score_at_match")
        .eq("id", conv.match_id)
        .maybeSingle(),
      supabase
        .from("user_blocks")
        .select("id")
        .or(
          `and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`
        )
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("first_name, city")
        .eq("id", otherUserId)
        .maybeSingle(),
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
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
    notFound();
  }

  return (
    <ChatRoomClient
      conversationId={conversationId}
      currentUserId={user.id}
      otherUserId={otherUserId}
      otherFirstName={otherProfile?.first_name || "Matched Flatmate"}
      otherCity={otherProfile?.city || ""}
      peaceScoreAtMatch={matchRow?.peace_score_at_match ?? null}
      initialMessages={(messages as MessageRow[]) ?? []}
    />
  );
}
