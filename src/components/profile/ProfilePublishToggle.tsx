"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export function ProfilePublishToggle({
  isPublished,
  canPublish,
}: {
  isPublished: boolean;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [published, setPublished] = useState(isPublished);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleToggle() {
    if (!published && !canPublish) {
      setMessage({
        type: "err",
        text: "Please complete your name, city, and 18+ age confirmation in Onboarding before publishing.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const nextVal = !published;
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: nextVal,
          onboardingCompleted: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Failed to update visibility." });
        return;
      }

      setPublished(nextVal);
      setMessage({
        type: "ok",
        text: nextVal
          ? "Your profile is now live in discovery."
          : "Your profile has been unpublished and hidden from discovery.",
      });
      router.refresh();
    } catch {
      setMessage({ type: "err", text: "Network error while updating profile status." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition ${
          published
            ? "bg-sand text-charcoal hover:bg-sand-dark border border-border"
            : "bg-forest text-ivory hover:bg-forest-light shadow-sm"
        }`}
      >
        {published ? (
          <>
            <Lock className="w-3.5 h-3.5 text-terracotta" />
            <span>{loading ? "Updating..." : "Unpublish / Pause Visibility"}</span>
          </>
        ) : (
          <>
            <Eye className="w-3.5 h-3.5" />
            <span>{loading ? "Publishing..." : "Publish Profile to Discovery"}</span>
          </>
        )}
      </button>

      {message && (
        <div
          className={`flex items-center gap-1.5 text-xs ${
            message.type === "ok" ? "text-forest" : "text-terracotta-dark"
          }`}
        >
          {message.type === "ok" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  );
}
