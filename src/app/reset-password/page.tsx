"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfigStatus } from "@/lib/env";
import { resetPasswordSchema } from "@/lib/validations";
import { ConfigStatusBanner } from "@/components/ui/ConfigStatusBanner";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const config = getSupabaseConfigStatus();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please enter a valid new password.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError(`Supabase Auth is not configured. Missing: ${config.missingVars.join(", ")}.`);
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: parsed.data.password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setUpdated(true);
      setTimeout(() => {
        router.push("/discover");
      }, 1500);
    } catch {
      setError("Network error while updating password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-11 h-11 rounded-2xl bg-sand flex items-center justify-center mx-auto text-forest">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="font-serif text-3xl text-charcoal">Choose a new password</h1>
        <p className="text-xs text-muted">
          Enter a strong password (at least 8 characters with letters and numbers).
        </p>
      </div>

      {!config.isConfigured && (
        <ConfigStatusBanner serviceName="Supabase Auth" missingVars={config.missingVars} />
      )}

      {updated ? (
        <div className="bg-white border border-forest/30 rounded-3xl p-7 shadow-warm text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-forest mx-auto" />
          <h2 className="font-serif text-xl text-charcoal">Password updated</h2>
          <p className="text-xs text-muted">Redirecting you to your account...</p>
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
            <label htmlFor="new-password" className="block text-xs font-medium text-charcoal mb-1">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ chars, letter & number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="block text-xs font-medium text-charcoal mb-1">
              Confirm new password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-forest hover:bg-forest-light disabled:opacity-60 text-ivory text-sm font-medium transition"
          >
            {loading ? "Updating password..." : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}
