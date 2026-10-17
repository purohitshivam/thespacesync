"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfigStatus } from "@/lib/env";
import { forgotPasswordSchema } from "@/lib/validations";
import { ConfigStatusBanner } from "@/components/ui/ConfigStatusBanner";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const config = getSupabaseConfigStatus();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please enter a valid email address.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError(`Supabase Auth is not configured. Missing: ${config.missingVars.join(", ")}.`);
      return;
    }

    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSent(true);
    } catch {
      setError("Network error while requesting password reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-11 h-11 rounded-2xl bg-sand flex items-center justify-center mx-auto text-forest">
          <KeyRound className="w-5 h-5" />
        </div>
        <h1 className="font-serif text-3xl text-charcoal">Reset your password</h1>
        <p className="text-xs text-muted">
          Enter the email address associated with your SpaceSync account and we&apos;ll send a recovery link.
        </p>
      </div>

      {!config.isConfigured && (
        <ConfigStatusBanner serviceName="Supabase Auth" missingVars={config.missingVars} />
      )}

      {sent ? (
        <div className="bg-white border border-forest/30 rounded-3xl p-7 shadow-warm text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-forest mx-auto" />
          <h2 className="font-serif text-xl text-charcoal">Recovery email sent</h2>
          <p className="text-xs text-muted leading-relaxed">
            If an account exists for <strong className="text-charcoal">{email}</strong>, you will receive a password reset link shortly.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block px-5 py-2.5 rounded-full bg-forest text-ivory text-xs font-medium"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-4"
          noValidate
        >
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-terracotta/10 border border-terracotta/40 text-xs text-terracotta-dark flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="reset-email" className="block text-xs font-medium text-charcoal mb-1">
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-forest hover:bg-forest-light disabled:opacity-60 text-ivory text-sm font-medium transition"
          >
            {loading ? "Sending recovery link..." : "Send Recovery Link"}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-muted">
        Remembered your password?{" "}
        <Link href="/login" className="text-forest font-semibold underline underline-offset-4">
          Back to login
        </Link>
      </p>
    </div>
  );
}
