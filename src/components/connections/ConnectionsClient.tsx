"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyOrbitState } from "@/components/ui/OrbitalGraphics";
import { getInitials } from "@/lib/utils";
import {
  HeartHandshake,
  MessageSquare,
  Check,
  X,
  MapPin,
  ArrowUpRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export interface ConnectionCardItem {
  id: string;
  otherUserId: string;
  otherFirstName: string;
  otherCity: string;
  otherOccupation: string;
  status: string;
  introNote?: string;
  peaceScoreSnapshot: number | null;
  conversationId?: string | null;
  timestamp: string;
}

interface ConnectionsClientProps {
  receivedInterests: ConnectionCardItem[];
  sentInterests: ConnectionCardItem[];
  mutualMatches: ConnectionCardItem[];
  inactiveConnections: ConnectionCardItem[];
}

export function ConnectionsClient({
  receivedInterests,
  sentInterests,
  mutualMatches,
  inactiveConnections,
}: ConnectionsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "received" | "matches" | "sent" | "inactive"
  >("received");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(
    targetUserId: string,
    action: "interest" | "decline" | "withdraw",
    peaceScore: number | null
  ) {
    setLoadingId(targetUserId);
    setError(null);
    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          action,
          peaceScore,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update connection.");
        return;
      }

      if (data.matched && data.conversation_id) {
        router.push(`/messages/${data.conversation_id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error while updating connection.");
    } finally {
      setLoadingId(null);
    }
  }

  const tabs = [
    { key: "received" as const, label: "Received Interests", count: receivedInterests.length },
    { key: "matches" as const, label: "Mutual Matches", count: mutualMatches.length },
    { key: "sent" as const, label: "Sent Interests", count: sentInterests.length },
    { key: "inactive" as const, label: "Passed & Inactive", count: inactiveConnections.length },
  ];

  const currentItems =
    activeTab === "received"
      ? receivedInterests
      : activeTab === "matches"
        ? mutualMatches
        : activeTab === "sent"
          ? sentInterests
          : inactiveConnections;

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition inline-flex items-center gap-2 ${
              activeTab === t.key
                ? "bg-forest text-ivory"
                : "bg-white border border-border text-charcoal hover:bg-sand"
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === t.key ? "bg-ivory/20 text-ivory" : "bg-sand text-charcoal"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-terracotta/10 border border-terracotta/40 text-xs text-terracotta-dark flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {currentItems.length === 0 ? (
        <EmptyOrbitState
          title={`No ${tabs.find((t) => t.key === activeTab)?.label.toLowerCase()} yet.`}
          description="All connection statuses come directly from persisted PostgreSQL records. Explore Discovery to express interest in compatible flatmates in your city."
          primaryActionLabel="Explore Discovery"
          primaryActionHref="/discover"
          showInviteHint={false}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white/95 backdrop-blur-sm border border-border/80 hover:border-forest/40 rounded-3xl p-6 sm:p-7 shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col justify-between space-y-4 transform hover:-translate-y-1"
            >
              <div className="space-y-4">
                {activeTab === "matches" && (
                  <div className="bg-forest/10 border border-forest/20 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs text-forest font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                      Mutual Sanctuary Handshake
                    </span>
                    <span className="text-[11px] font-medium text-forest/80">Direct Chat Unlocked</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sand/80 border border-border text-forest font-serif text-lg font-bold flex items-center justify-center shrink-0 group-hover:border-forest/30 transition-colors">
                      {getInitials(item.otherFirstName)}
                    </div>
                    <div>
                      <h2 className="font-serif text-xl text-charcoal group-hover:text-forest transition-colors">
                        {item.otherFirstName}
                      </h2>
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-terracotta shrink-0" />
                        {item.otherCity}
                        {item.otherOccupation ? ` · ${item.otherOccupation}` : ""}
                      </p>
                    </div>
                  </div>

                  {item.peaceScoreSnapshot !== null && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.peaceScoreSnapshot >= 90
                          ? "bg-forest/10 text-forest border border-forest/20"
                          : item.peaceScoreSnapshot >= 75
                            ? "bg-sand text-charcoal border border-sand-dark"
                            : "bg-terracotta/10 text-terracotta-dark border border-terracotta/20"
                      }`}
                    >
                      {item.peaceScoreSnapshot}% Peace
                    </span>
                  )}
                </div>

                {item.introNote && (
                  <div className="p-3.5 rounded-2xl bg-ivory border border-border text-xs text-charcoal italic leading-relaxed">
                    &ldquo;{item.introNote}&rdquo;
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/discover/${item.otherUserId}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline"
                >
                  <span>View Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                {activeTab === "received" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loadingId === item.otherUserId}
                      onClick={() =>
                        handleAction(item.otherUserId, "interest", item.peaceScoreSnapshot)
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-forest hover:bg-forest-light text-ivory text-xs font-semibold transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept & Match
                    </button>
                    <button
                      type="button"
                      disabled={loadingId === item.otherUserId}
                      onClick={() =>
                        handleAction(item.otherUserId, "decline", item.peaceScoreSnapshot)
                      }
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full border border-border bg-ivory hover:bg-sand text-xs font-medium text-charcoal transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                )}

                {activeTab === "matches" && (
                  <Link
                    href={
                      item.conversationId
                        ? `/messages/${item.conversationId}`
                        : "/messages"
                    }
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-forest hover:bg-forest-light text-ivory text-xs font-semibold transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Open Chat
                  </Link>
                )}

                {activeTab === "sent" && (
                  <button
                    type="button"
                    disabled={loadingId === item.otherUserId}
                    onClick={() =>
                      handleAction(item.otherUserId, "withdraw", item.peaceScoreSnapshot)
                    }
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-border bg-ivory hover:bg-sand text-xs font-medium text-muted transition"
                  >
                    Withdraw Interest
                  </button>
                )}

                {activeTab === "inactive" && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted capitalize">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Status: {item.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
