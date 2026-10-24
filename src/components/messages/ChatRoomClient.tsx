"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MessageRow } from "@/types/database";
import { getInitials } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  Check,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  Flag,
  Ban,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface ChatRoomClientProps {
  conversationId: string;
  currentUserId: string;
  otherUserId: string;
  otherFirstName: string;
  otherCity: string;
  peaceScoreAtMatch: number | null;
  initialMessages: MessageRow[];
}

export function ChatRoomClient({
  conversationId,
  currentUserId,
  otherUserId,
  otherFirstName,
  otherCity,
  peaceScoreAtMatch,
  initialMessages,
}: ChatRoomClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [failedDraft, setFailedDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("harassment_or_abuse");
  const [reportDescription, setReportDescription] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Mark incoming unread messages as read on mount
  useEffect(() => {
    fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    }).catch(() => null);
  }, [conversationId]);

  // Subscribe to Supabase Realtime for new & updated messages in this conversation
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          if (newMsg.sender_id !== currentUserId) {
            fetch("/api/messages", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ conversationId }),
            }).catch(() => null);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as MessageRow;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessageText(textToSend: string) {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    setSending(true);
    setError(null);
    setFailedDraft(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          body: trimmed,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.message) {
        setError(data.error || "Message could not be saved to the database.");
        setFailedDraft(trimmed);
        return;
      }

      // Only add delivered message AFTER confirmed PostgreSQL persistence
      const persistedMsg = data.message as MessageRow;
      setMessages((prev) => {
        if (prev.some((m) => m.id === persistedMsg.id)) return prev;
        return [...prev, persistedMsg];
      });
      setDraft("");
    } catch {
      setError("Network error: message was not delivered.");
      setFailedDraft(trimmed);
    } finally {
      setSending(false);
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendMessageText(draft);
  }

  async function handleBlockUser() {
    if (
      !window.confirm(
        `Block ${otherFirstName}? This will immediately close this conversation and prevent any further contact.`
      )
    ) {
      return;
    }

    const res = await fetch("/api/safety/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockedUserId: otherUserId,
        reason: "Blocked from conversation",
      }),
    });
    if (res.ok) {
      router.push("/messages");
      router.refresh();
    }
  }

  async function handleReportSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/safety/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportedUserId: otherUserId,
        conversationId,
        reason: reportReason,
        description: reportDescription,
      }),
    });
    if (res.ok) {
      setShowReportModal(false);
      setReportDescription("");
      alert("Confidential report submitted to SpaceSync moderators.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-5rem)]">
      {/* Conversation Header */}
      <div className="bg-white border border-border rounded-3xl p-4 sm:p-5 shadow-warm flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/messages"
            className="p-2 rounded-full hover:bg-sand text-charcoal transition"
            aria-label="Back to Inbox"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-forest/10 border border-forest/20 flex items-center justify-center font-serif font-bold text-forest text-base">
            {getInitials(otherFirstName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/discover/${otherUserId}`}
                className="font-serif text-lg text-charcoal hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{otherFirstName}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted hover:text-forest" />
              </Link>
              {peaceScoreAtMatch !== null && (
                <span className="px-2.5 py-0.5 rounded-full bg-forest/10 text-forest text-[11px] font-semibold border border-forest/20">
                  {peaceScoreAtMatch}% Peace
                </span>
              )}
            </div>
            <p className="text-xs text-muted flex items-center gap-1">
              <span>{otherCity}</span>
              <span>·</span>
              <span className="text-forest font-medium">Direct Chat Unlocked</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReportModal((prev) => !prev)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted hover:text-charcoal hover:bg-sand/60"
          >
            <Flag className="w-3.5 h-3.5" />
            Report
          </button>
          <button
            type="button"
            onClick={handleBlockUser}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-terracotta-dark hover:bg-terracotta/10"
          >
            <Ban className="w-3.5 h-3.5" />
            Block
          </button>
        </div>
      </div>

      {showReportModal && (
        <form
          onSubmit={handleReportSubmit}
          className="bg-white border border-terracotta/40 rounded-2xl p-4 mb-4 space-y-3 text-xs"
        >
          <p className="font-semibold text-charcoal">
            Report conversation with {otherFirstName}
          </p>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-border bg-ivory"
          >
            <option value="harassment_or_abuse">Harassment or abusive messages</option>
            <option value="spam_or_commercial_solicitation">Broker or commercial spam</option>
            <option value="off_platform_scam_attempt">Deposit / financial scam request</option>
            <option value="inappropriate_content">Inappropriate content</option>
            <option value="other">Other</option>
          </select>
          <textarea
            rows={2}
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            placeholder="Describe what happened..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-ivory"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-terracotta text-ivory font-semibold"
            >
              Submit Report
            </button>
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="px-4 py-1.5 rounded-full text-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Message Stream */}
      <div className="flex-1 bg-white border border-border rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-warm">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 flex items-center justify-center text-forest">
              <Sparkles className="w-6 h-6 text-terracotta" />
            </div>
            <div>
              <p className="font-serif text-xl text-charcoal">
                Start the conversation with {otherFirstName}
              </p>
              <p className="text-xs max-w-md leading-relaxed text-muted mt-1">
                You matched with a {peaceScoreAtMatch ? `${peaceScoreAtMatch}% Peace Score` : "high compatibility score"}. Send a friendly hello or tap a starter below to kick things off:
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 max-w-md pt-2">
              <button
                type="button"
                onClick={() =>
                  setDraft(
                    `Hi ${otherFirstName}! I noticed we matched on SpaceSync. What areas or neighbourhoods are you currently exploring?`
                  )
                }
                className="px-3.5 py-2 rounded-full border border-border bg-ivory hover:bg-sand text-xs text-charcoal font-medium transition text-left"
              >
                📍 Ask about preferred areas
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft(
                    `Hey ${otherFirstName}! When are you looking to move in, and what's your ideal 11-month lease timeframe?`
                  )
                }
                className="px-3.5 py-2 rounded-full border border-border bg-ivory hover:bg-sand text-xs text-charcoal font-medium transition text-left"
              >
                🗓️ Ask about move-in timeline
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft(
                    `Hey ${otherFirstName}! Are you working from home or going into an office/campus on weekdays?`
                  )
                }
                className="px-3.5 py-2 rounded-full border border-border bg-ivory hover:bg-sand text-xs text-charcoal font-medium transition text-left"
              >
                💼 Ask about WFH / routine
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMine
                      ? "bg-forest text-ivory rounded-br-sm"
                      : "bg-ivory border border-border text-charcoal rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-muted">
                  <span>
                    {new Date(msg.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMine && (
                    <span title={msg.read_at ? "Read" : "Saved & Delivered"}>
                      {msg.read_at ? (
                        <CheckCheck className="w-3.5 h-3.5 text-forest" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-muted" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error & Retry State */}
      {error && (
        <div
          role="alert"
          className="mt-3 p-3 rounded-2xl bg-terracotta/10 border border-terracotta/40 text-xs text-terracotta-dark flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {failedDraft && (
            <button
              type="button"
              onClick={() => sendMessageText(failedDraft)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-terracotta text-ivory font-semibold shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Send
            </button>
          )}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleFormSubmit}
        className="mt-4 bg-white border border-border rounded-full p-2 pl-5 flex items-center gap-2 shadow-warm"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          placeholder={`Write a message to ${otherFirstName}...`}
          className="flex-1 bg-transparent text-sm text-charcoal focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="px-5 py-2.5 rounded-full bg-forest hover:bg-forest-light disabled:opacity-50 text-ivory text-xs font-semibold inline-flex items-center gap-1.5 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{sending ? "Saving..." : "Send"}</span>
        </button>
      </form>
    </div>
  );
}
