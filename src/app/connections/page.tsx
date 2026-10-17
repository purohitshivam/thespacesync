import React from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ConnectionsClient,
  type ConnectionCardItem,
} from "@/components/connections/ConnectionsClient";

export const metadata = {
  title: "Connections & Mutual Matches",
};

export default async function ConnectionsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?redirectTo=/connections&reason=auth_required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/connections");
  }

  const [{ data: interests }, { data: matches }, { data: conversations }] =
    await Promise.all([
      supabase
        .from("interests")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("updated_at", { ascending: false }),
      supabase
        .from("matches")
        .select("*")
        .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
        .order("matched_at", { ascending: false }),
      supabase
        .from("conversations")
        .select("id, match_id, user_one_id, user_two_id")
        .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`),
    ]);

  const otherUserIds = new Set<string>();
  for (const i of interests ?? []) {
    otherUserIds.add(i.sender_id === user.id ? i.receiver_id : i.sender_id);
  }
  for (const m of matches ?? []) {
    otherUserIds.add(m.user_one_id === user.id ? m.user_two_id : m.user_one_id);
  }

  const profileLookup = new Map<
    string,
    { first_name: string; city: string; occupation_title: string }
  >();

  if (otherUserIds.size > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, first_name, city, occupation_title")
      .in("id", Array.from(otherUserIds));

    for (const p of profs ?? []) {
      profileLookup.set(p.id, {
        first_name: p.first_name || "Flatmate",
        city: p.city || "",
        occupation_title: p.occupation_title || "",
      });
    }
  }

  const convByMatchId = new Map<string, string>();
  for (const c of conversations ?? []) {
    convByMatchId.set(c.match_id, c.id);
  }

  const receivedInterests: ConnectionCardItem[] = [];
  const sentInterests: ConnectionCardItem[] = [];
  const inactiveConnections: ConnectionCardItem[] = [];

  for (const i of interests ?? []) {
    const otherId = i.sender_id === user.id ? i.receiver_id : i.sender_id;
    const p = profileLookup.get(otherId);
    const card: ConnectionCardItem = {
      id: i.id,
      otherUserId: otherId,
      otherFirstName: p?.first_name ?? "Flatmate",
      otherCity: p?.city ?? "",
      otherOccupation: p?.occupation_title ?? "",
      status: i.status,
      introNote: i.intro_note,
      peaceScoreSnapshot: i.peace_score_snapshot,
      timestamp: i.updated_at,
    };

    if (i.receiver_id === user.id && i.status === "pending") {
      receivedInterests.push(card);
    } else if (i.sender_id === user.id && i.status === "pending") {
      sentInterests.push(card);
    } else if (["declined", "passed", "withdrawn"].includes(i.status)) {
      inactiveConnections.push(card);
    }
  }

  const mutualMatches: ConnectionCardItem[] = [];
  for (const m of matches ?? []) {
    const otherId = m.user_one_id === user.id ? m.user_two_id : m.user_one_id;
    const p = profileLookup.get(otherId);
    const card: ConnectionCardItem = {
      id: m.id,
      otherUserId: otherId,
      otherFirstName: p?.first_name ?? "Flatmate",
      otherCity: p?.city ?? "",
      otherOccupation: p?.occupation_title ?? "",
      status: m.status,
      peaceScoreSnapshot: m.peace_score_at_match,
      conversationId: convByMatchId.get(m.id) ?? null,
      timestamp: m.matched_at,
    };

    if (m.status === "active") {
      mutualMatches.push(card);
    } else {
      inactiveConnections.push(card);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Interests & Mutual Matches
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mt-1">
          Your Connections
        </h1>
        <p className="text-sm text-muted mt-1">
          Respond to incoming interests, manage sent requests, and open conversations with mutual matches.
        </p>
      </div>

      <ConnectionsClient
        receivedInterests={receivedInterests}
        sentInterests={sentInterests}
        mutualMatches={mutualMatches}
        inactiveConnections={inactiveConnections}
      />
    </div>
  );
}
