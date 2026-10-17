"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeartHandshake,
  X,
  Flag,
  Ban,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

interface ProfileActionsBarProps {
  targetUserId: string;
  targetName: string;
  peaceScore: number | null;
  initialInterestStatus?: string | null;
  conversationId?: string | null;
}

export function ProfileActionsBar({
  targetUserId,
  targetName,
  peaceScore,
  initialInterestStatus = null,
  conversationId = null,
}: ProfileActionsBarProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(initialInterestStatus);
  const [matchConvId, setMatchConvId] = useState<string | null>(conversationId);
  const [introNote, setIntroNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("harassment_or_abuse");
  const [reportDescription, setReportDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleInterestAction(action: "interest" | "pass" | "withdraw") {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          action,
          introNote: action === "interest" ? introNote : "",
          peaceScore,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "err",
          text: data.error || "Could not process action. Please ensure you are signed in.",
        });
        return;
      }

      setStatus(data.status);
      setShowNoteInput(false);

      if (data.matched && data.conversation_id) {
        setMatchConvId(data.conversation_id);
        setFeedback({
          type: "ok",
          text: `It's a mutual match with ${targetName}! You can now message each other.`,
        });
      } else if (action === "interest") {
        setFeedback({
          type: "ok",
          text: `Interest sent to ${targetName}. You'll be notified if they match back.`,
        });
      } else if (action === "pass") {
        setFeedback({
          type: "ok",
          text: "Profile passed.",
        });
      } else if (action === "withdraw") {
        setFeedback({
          type: "ok",
          text: "Interest withdrawn.",
        });
      }
      router.refresh();
    } catch {
      setFeedback({ type: "err", text: "Network error while saving action." });
    } finally {
      setLoading(false);
    }
  }

  async function handleBlockUser() {
    if (!window.confirm(`Block ${targetName}? Neither of you will see or contact each other on SpaceSync.`)) {
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/safety/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockedUserId: targetUserId,
          reason: "Blocked from profile view",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "err", text: data.error || "Failed to block user." });
        return;
      }
      router.push("/discover");
      router.refresh();
    } catch {
      setFeedback({ type: "err", text: "Network error while blocking user." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/safety/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedUserId: targetUserId,
          reason: reportReason,
          description: reportDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "err", text: data.error || "Failed to submit report." });
        return;
      }
      setShowReportModal(false);
      setReportDescription("");
      setFeedback({
        type: "ok",
        text: "Report submitted privately to SpaceSync moderators.",
      });
    } catch {
      setFeedback({ type: "err", text: "Network error while submitting report." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {matchConvId || status === "accepted" ? (
            <button
              type="button"
              onClick={() => router.push(matchConvId ? `/messages/${matchConvId}` : "/messages")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest hover:bg-forest-light text-ivory text-xs font-semibold shadow-sm transition"
            >
              <MessageSquare className="w-4 h-4" />
              Message {targetName}
            </button>
          ) : status === "pending" ? (
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 rounded-full bg-sand text-forest text-xs font-semibold">
                Interest Pending
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleInterestAction("withdraw")}
                className="px-4 py-2 rounded-full border border-border bg-white hover:bg-sand text-xs text-muted transition"
              >
                Withdraw
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowNoteInput((prev) => !prev)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest hover:bg-forest-light text-ivory text-xs font-semibold shadow-sm transition"
              >
                <HeartHandshake className="w-4 h-4" />
                Express Interest
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleInterestAction("pass")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border bg-white hover:bg-sand text-xs font-medium text-charcoal transition"
              >
                <X className="w-3.5 h-3.5" />
                Pass
              </button>
            </>
          )}
        </div>

        {/* Safety controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReportModal((prev) => !prev)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted hover:text-charcoal hover:bg-sand/60 transition"
          >
            <Flag className="w-3.5 h-3.5" />
            Report
          </button>
          <button
            type="button"
            onClick={handleBlockUser}
            disabled={loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-terracotta-dark hover:bg-terracotta/10 transition"
          >
            <Ban className="w-3.5 h-3.5" />
            Block
          </button>
        </div>
      </div>

      {/* Optional Intro Note Drawer */}
      {showNoteInput && (
        <div className="p-4 rounded-2xl bg-ivory border border-border space-y-3">
          <label className="block text-xs font-medium text-charcoal">
            Add an optional note about your flatshare plans (max 280 chars)
          </label>
          <textarea
            rows={2}
            maxLength={280}
            value={introNote}
            onChange={(e) => setIntroNote(e.target.value)}
            placeholder={`Hi ${targetName}, our budgets and timelines in this area overlap well—would love to connect!`}
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-white text-xs text-charcoal"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleInterestAction("interest")}
              className="px-5 py-2 rounded-full bg-forest text-ivory text-xs font-semibold"
            >
              {loading ? "Sending..." : "Send Interest"}
            </button>
            <button
              type="button"
              onClick={() => setShowNoteInput(false)}
              className="px-4 py-2 rounded-full text-xs text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Report Modal / Drawer */}
      {showReportModal && (
        <form
          onSubmit={handleSubmitReport}
          className="p-5 rounded-2xl bg-ivory border border-terracotta/40 space-y-3"
        >
          <h4 className="font-serif text-base text-charcoal">Report {targetName}</h4>
          <p className="text-xs text-muted">
            Reports are strictly confidential and reviewed by SpaceSync moderators.
          </p>
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">Reason *</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs text-charcoal"
            >
              <option value="harassment_or_abuse">Harassment or disrespectful conduct</option>
              <option value="fake_or_misleading_profile">Fake, broker, or misleading profile</option>
              <option value="spam_or_commercial_solicitation">Spam or commercial property listing</option>
              <option value="inappropriate_content">Inappropriate profile content</option>
              <option value="discrimination_or_hate_speech">Discrimination or hate speech</option>
              <option value="off_platform_scam_attempt">Financial scam or deposit request</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal mb-1">
              Optional details
            </label>
            <textarea
              rows={2}
              maxLength={1000}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Provide any context that helps our moderation team..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs text-charcoal"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full bg-terracotta text-ivory text-xs font-semibold"
            >
              {loading ? "Submitting..." : "Submit Confidential Report"}
            </button>
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="px-4 py-2 rounded-full text-xs text-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {feedback && (
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
            feedback.type === "ok"
              ? "bg-forest/10 border-forest/30 text-forest"
              : "bg-terracotta/10 border-terracotta/40 text-terracotta-dark"
          }`}
        >
          {feedback.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  );
}
