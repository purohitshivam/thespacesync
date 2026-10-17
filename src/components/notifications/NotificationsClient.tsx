"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyOrbitState } from "@/components/ui/OrbitalGraphics";
import type { NotificationRow } from "@/types/database";
import { Bell, CheckCheck, ArrowRight } from "lucide-react";

export function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: NotificationRow[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationRow[]>(initialNotifications);
  const [loading, setLoading] = useState(false);

  async function handleMarkAllRead() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkOneRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    router.refresh();
  }

  const unreadCount = items.filter((i) => !i.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
        </span>
        {unreadCount > 0 && (
          <button
            type="button"
            disabled={loading}
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sand hover:bg-sand-dark text-xs font-semibold text-charcoal transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-forest" />
            Mark all as read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyOrbitState
          title="No notifications yet."
          description="You'll receive persistent in-app alerts here whenever someone expresses interest in your profile, establishes a mutual match, or sends you a message."
          primaryActionLabel="Explore Discovery"
          primaryActionHref="/discover"
          showInviteHint={false}
        />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`rounded-3xl border p-5 shadow-warm transition flex items-start justify-between gap-4 ${
                n.is_read
                  ? "bg-white border-border"
                  : "bg-ivory border-forest/40"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    n.is_read ? "bg-sand text-muted" : "bg-forest text-ivory"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-base text-charcoal">{n.title}</h2>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-terracotta" />
                    )}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-muted pt-1">
                    {new Date(n.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.action_url && (
                  <Link
                    href={n.action_url}
                    onClick={() => {
                      if (!n.is_read) handleMarkOneRead(n.id);
                    }}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-sand hover:bg-sand-dark text-xs font-semibold text-forest transition"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
