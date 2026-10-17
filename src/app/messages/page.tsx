import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyOrbitState } from "@/components/ui/OrbitalGraphics";
import { getInitials } from "@/lib/utils";
import { MessageSquare, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Messages & Conversations",
};

export default async function MessagesInboxPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?redirectTo=/messages&reason=auth_required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/messages");
  }

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const otherUserIds = (conversations ?? []).map((c) =>
    c.user_one_id === user.id ? c.user_two_id : c.user_one_id
  );

  const profileMap = new Map<string, { first_name: string; city: string }>();
  if (otherUserIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, first_name, city")
      .in("id", otherUserIds);
    for (const p of profs ?? []) {
      profileMap.set(p.id, {
        first_name: p.first_name || "Flatmate",
        city: p.city || "",
      });
    }
  }

  // Count unread messages per conversation
  const unreadCountMap = new Map<string, number>();
  if (conversations && conversations.length > 0) {
    const { data: unreadRows } = await supabase
      .from("messages")
      .select("conversation_id")
      .in(
        "conversation_id",
        conversations.map((c) => c.id)
      )
      .neq("sender_id", user.id)
      .is("read_at", null);

    for (const r of unreadRows ?? []) {
      unreadCountMap.set(
        r.conversation_id,
        (unreadCountMap.get(r.conversation_id) ?? 0) + 1
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          One-to-One Match Messaging
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mt-1">
          Conversation Inbox
        </h1>
        <p className="text-sm text-muted mt-1">
          Conversations open automatically when two flatmates establish a mutual match.
        </p>
      </div>

      {!conversations || conversations.length === 0 ? (
        <EmptyOrbitState
          title="No active conversations yet."
          description="SpaceSync never generates sample messages or fake chat bots. Once you and another flatmate express mutual interest, your private conversation will appear here."
          primaryActionLabel="Explore Discovery"
          primaryActionHref="/discover"
          showInviteHint={false}
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const otherId =
              conv.user_one_id === user.id ? conv.user_two_id : conv.user_one_id;
            const other = profileMap.get(otherId);
            const unread = unreadCountMap.get(conv.id) ?? 0;

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="block bg-white border border-border hover:border-forest rounded-3xl p-5 shadow-warm transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-sand flex items-center justify-center font-serif text-lg font-semibold text-forest shrink-0">
                      {getInitials(other?.first_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-lg text-charcoal truncate">
                          {other?.first_name ?? "Matched Flatmate"}
                        </h2>
                        {other?.city && (
                          <span className="text-xs text-muted">· {other.city}</span>
                        )}
                        {unread > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-terracotta text-ivory text-[10px] font-semibold">
                            {unread} new
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted truncate mt-0.5">
                        {conv.last_message_preview ||
                          "Mutual match established — say hello and compare flat plans!"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted">
                    {conv.last_message_at && (
                      <span>
                        {new Date(conv.last_message_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                    <span className="w-8 h-8 rounded-full bg-ivory border border-border flex items-center justify-center text-forest">
                      {unread > 0 ? (
                        <MessageSquare className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
