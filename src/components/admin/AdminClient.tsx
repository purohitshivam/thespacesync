"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ModerationAuditLogRow,
  ProfileRow,
  ReportRow,
  WaitlistEntryRow,
} from "@/types/database";
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Ban,
  UserCheck,
} from "lucide-react";

interface AdminMetrics {
  registeredUsers: number;
  verifiedUsers: number;
  completedProfiles: number;
  publishedProfiles: number;
  interestsCount: number;
  mutualMatchesCount: number;
  conversationsCount: number;
  messagesCount: number;
  waitlistCount: number;
  premiumConversionsCount: number;
}

interface AdminClientProps {
  metrics: AdminMetrics;
  reports: ReportRow[];
  recentUsers: ProfileRow[];
  waitlistEntries: WaitlistEntryRow[];
  auditLogs: ModerationAuditLogRow[];
}

export function AdminClient({
  metrics,
  reports,
  recentUsers,
  waitlistEntries,
  auditLogs,
}: AdminClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  async function runModerationAction(payload: {
    actionType: "resolve_report" | "dismiss_report" | "suspend_user" | "reactivate_user";
    reportId?: string;
    targetUserId?: string;
    notes?: string;
  }) {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "err",
          text: data.error || "Moderation action failed.",
        });
        return;
      }
      setFeedback({
        type: "ok",
        text: `Moderation action (${payload.actionType}) saved and logged.`,
      });
      router.refresh();
    } catch {
      setFeedback({ type: "err", text: "Network error during moderation action." });
    } finally {
      setLoading(false);
    }
  }

  const metricCards = [
    { label: "Registered Users", value: metrics.registeredUsers },
    { label: "Verified Email Users", value: metrics.verifiedUsers },
    { label: "Completed Profiles", value: metrics.completedProfiles },
    { label: "Published Profiles", value: metrics.publishedProfiles },
    { label: "Expressed Interests", value: metrics.interestsCount },
    { label: "Mutual Matches", value: metrics.mutualMatchesCount },
    { label: "Active Conversations", value: metrics.conversationsCount },
    { label: "Persisted Messages", value: metrics.messagesCount },
    {
      label: "Waitlist Sign-ups (Week 4 Target: 50+)",
      value: metrics.waitlistCount,
    },
    {
      label: "Paid Premium Subscriptions (Week 6 Target: 5+)",
      value: metrics.premiumConversionsCount,
    },
  ];

  return (
    <div className="space-y-10">
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
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

      {/* Live Database Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricCards.map((m) => (
          <div
            key={m.label}
            className="bg-white border border-border rounded-2xl p-4 shadow-warm flex flex-col justify-between"
          >
            <span className="text-[11px] font-medium text-muted leading-snug">
              {m.label}
            </span>
            <span className="font-serif text-3xl font-semibold text-charcoal mt-3">
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* Safety Reports Queue */}
      <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-charcoal">
              Safety Reports & Moderation Queue
            </h2>
            <p className="text-xs text-muted">
              Review confidential user reports and take moderation action.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-sand text-xs font-semibold text-charcoal">
            {reports.length} report(s)
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="p-6 rounded-2xl bg-ivory border border-border text-center text-xs text-muted">
            Zero safety reports in the database.
          </div>
        ) : (
          <div className="divide-y divide-border text-xs">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-terracotta/15 text-terracotta-dark font-semibold">
                      {rep.reason.replace(/_/g, " ")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sand text-charcoal font-medium">
                      Status: {rep.status}
                    </span>
                  </div>
                  <p className="text-charcoal">{rep.description || "No description provided."}</p>
                  <p className="text-[11px] text-muted font-mono">
                    Reported User ID: {rep.reported_user_id} · Created:{" "}
                    {new Date(rep.created_at).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      runModerationAction({
                        actionType: "resolve_report",
                        reportId: rep.id,
                        targetUserId: rep.reported_user_id,
                        notes: "Resolved by admin",
                      })
                    }
                    className="px-3.5 py-1.5 rounded-full bg-forest text-ivory font-semibold"
                  >
                    Mark Resolved
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      runModerationAction({
                        actionType: "dismiss_report",
                        reportId: rep.id,
                        notes: "Dismissed after review",
                      })
                    }
                    className="px-3.5 py-1.5 rounded-full border border-border bg-ivory text-charcoal"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      runModerationAction({
                        actionType: "suspend_user",
                        targetUserId: rep.reported_user_id,
                        reportId: rep.id,
                        notes: "Suspended from report queue",
                      })
                    }
                    className="px-3.5 py-1.5 rounded-full bg-terracotta text-ivory font-semibold"
                  >
                    Suspend Reported User
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Directory & Account Suspension Controls */}
      <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-4">
        <h2 className="font-serif text-2xl text-charcoal">
          Registered User Accounts ({recentUsers.length})
        </h2>
        {recentUsers.length === 0 ? (
          <div className="p-6 rounded-2xl bg-ivory border border-border text-center text-xs text-muted">
            Zero registered profiles in the database.
          </div>
        ) : (
          <div className="divide-y divide-border text-xs">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="font-semibold text-charcoal">
                    {u.first_name || "Unnamed User"}
                  </span>
                  <span className="text-muted ml-2">
                    ({u.city || "No city"}) · Status:{" "}
                    <strong className="capitalize">{u.account_status}</strong> ·{" "}
                    {u.is_published ? "Published" : "Unpublished"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {u.account_status === "active" ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        runModerationAction({
                          actionType: "suspend_user",
                          targetUserId: u.id,
                          notes: "Admin manual suspension",
                        })
                      }
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-terracotta text-terracotta-dark hover:bg-terracotta/10 font-medium"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Suspend
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        runModerationAction({
                          actionType: "reactivate_user",
                          targetUserId: u.id,
                          notes: "Admin reactivation",
                        })
                      }
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-forest text-ivory font-medium"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Waitlist & Audit Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-3xl p-6 shadow-warm space-y-3">
          <h3 className="font-serif text-xl text-charcoal">
            Recent Waitlist Sign-ups ({waitlistEntries.length})
          </h3>
          {waitlistEntries.length === 0 ? (
            <p className="text-xs text-muted italic">No waitlist entries recorded yet.</p>
          ) : (
            <div className="divide-y divide-border text-xs">
              {waitlistEntries.map((w) => (
                <div key={w.id} className="py-2.5 flex justify-between">
                  <span className="font-medium text-charcoal">{w.email}</span>
                  <span className="text-muted">
                    {w.intended_city} · {w.moving_timeline || "Flexible"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-warm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <h3 className="font-serif text-xl text-charcoal">Moderation Audit Log</h3>
          </div>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-muted italic">No moderation actions recorded yet.</p>
          ) : (
            <div className="divide-y divide-border text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 space-y-0.5">
                  <div className="flex justify-between font-medium text-charcoal">
                    <span>{log.action_type}</span>
                    <span className="text-[10px] text-muted">
                      {new Date(log.created_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {log.notes && <p className="text-muted">{log.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
