"use client";

import React, { useState } from "react";
import { PRIMARY_CITIES, MOVING_TIMELINE_OPTIONS } from "@/lib/constants/options";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [intendedCity, setIntendedCity] = useState("Bangalore");
  const [movingTimeline, setMovingTimeline] = useState("within_1_month");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          intended_city: intendedCity,
          moving_timeline: movingTimeline || null,
          consent_communications: consent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(
          data.error ||
            "Could not complete your waitlist sign-up right now. Please verify database configuration and try again."
        );
        return;
      }

      // Only show confirmation AFTER the database write succeeds
      setStatus("success");
      setMessage(
        data.message ||
          "You have been added to the city waitlist. We will notify you when new cohorts in your city join."
      );
      setEmail("");
      setConsent(false);
    } catch {
      setStatus("error");
      setMessage("A network error occurred while saving your waitlist entry. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className="bg-white border border-forest/30 rounded-3xl p-6 md:p-8 shadow-warm text-left"
        data-testid="waitlist-success"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-forest shrink-0 mt-0.5" />
          <div>
            <h3 className="font-serif text-xl text-charcoal">Waitlist Spot Recorded</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">{message}</p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-4 text-xs font-semibold text-forest underline underline-offset-4"
            >
              Register another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-4 text-left"
      data-testid="waitlist-form"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest">
        <Sparkles className="w-3.5 h-3.5 text-terracotta" />
        <span>City Cohort Waitlist</span>
      </div>
      <h3 className="font-serif text-2xl text-charcoal">
        Not moving immediately? Join your city&apos;s launch cohort.
      </h3>
      <p className="text-xs text-muted leading-relaxed">
        We onboard student cohorts, MBA batches, and relocating professionals in waves across Bangalore, Mumbai, and Delhi NCR. No spam and no fake waitlist counters.
      </p>

      {status === "error" && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-terracotta/10 border border-terracotta/40 text-xs text-terracotta-dark flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="waitlist-email" className="block text-xs font-medium text-charcoal mb-1">
            Email address *
          </label>
          <input
            id="waitlist-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
          />
        </div>

        <div>
          <label htmlFor="waitlist-city" className="block text-xs font-medium text-charcoal mb-1">
            Intended city *
          </label>
          <select
            id="waitlist-city"
            value={intendedCity}
            onChange={(e) => setIntendedCity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
          >
            {PRIMARY_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="waitlist-timeline" className="block text-xs font-medium text-charcoal mb-1">
            Expected moving timeline
          </label>
          <select
            id="waitlist-timeline"
            value={movingTimeline}
            onChange={(e) => setMovingTimeline(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
          >
            {MOVING_TIMELINE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-xs text-muted cursor-pointer pt-1">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 rounded border-border text-forest focus:ring-forest"
        />
        <span>
          I consent to receive relevant SpaceSync city launch and cohort onboarding updates. I can unsubscribe anytime.
        </span>
      </label>

      <div className="pt-1">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="px-6 py-2.5 rounded-full bg-forest hover:bg-forest-light disabled:opacity-60 text-ivory text-sm font-medium transition"
        >
          {status === "submitting" ? "Saving to database..." : "Join City Waitlist"}
        </button>
      </div>
    </form>
  );
}
