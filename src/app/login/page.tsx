"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfigStatus } from "@/lib/env";
import { loginSchema } from "@/lib/validations";
import { ConfigStatusBanner } from "@/components/ui/ConfigStatusBanner";
import { AlertCircle, ArrowRight, Lock } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/discover";
  const reason = searchParams.get("reason");

  const config = getSupabaseConfigStatus();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please enter a valid email and password.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError(
        `Supabase authentication is not configured in this environment. Missing: ${config.missingVars.join(", ")}.`
      );
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("email not confirmed")) {
          setError("Please verify your email address before signing in. Check your inbox for the verification link.");
        } else {
          setError(signInError.message || "Invalid email or password.");
        }
        return;
      }

      if (data.user) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError("Network error while signing in. Please try again.");
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
        <h1 className="font-serif text-3xl text-charcoal">Welcome back</h1>
        <p className="text-xs text-muted">
          Sign in to manage your compatibility profile, review matches, and chat.
        </p>
      </div>

      {reason === "auth_required" && (
        <div className="p-3.5 rounded-2xl bg-sand border border-border text-xs text-charcoal">
          Please sign in to access <code className="font-mono">{redirectTo}</code>.
        </div>
      )}

      {!config.isConfigured && (
        <ConfigStatusBanner
          serviceName="Supabase Auth"
          missingVars={config.missingVars}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-4"
        data-testid="login-form"
        noValidate
      >
        {error && (
          <div
            role="alert"
            data-testid="auth-error"
            className="p-3.5 rounded-2xl bg-terracotta/10 border border-terracotta/40 text-xs text-terracotta-dark flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="block text-xs font-medium text-charcoal mb-1">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="block text-xs font-medium text-charcoal">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-forest hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-forest hover:bg-forest-light disabled:opacity-60 text-ivory text-sm font-medium inline-flex items-center justify-center gap-2 transition"
        >
          <span>{loading ? "Signing in..." : "Sign in"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-muted">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="text-forest font-semibold underline underline-offset-4">
          Create your profile
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-14 text-center text-sm text-muted">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
