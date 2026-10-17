"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseConfigStatus } from "@/lib/env";
import { signupSchema } from "@/lib/validations";
import { ConfigStatusBanner } from "@/components/ui/ConfigStatusBanner";
import { AlertCircle, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const config = getSupabaseConfigStatus();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ageConfirmed18Plus, setAgeConfirmed18Plus] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = signupSchema.safeParse({
      firstName,
      email,
      password,
      confirmPassword,
      ageConfirmed18Plus,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please check your registration details.");
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
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
          data: {
            first_name: parsed.data.firstName,
            age_confirmed_18_plus: true,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("already registered")) {
          setError(
            "An account with this email address already exists. Please log in or reset your password."
          );
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Duplicate account detection when Supabase email enumeration protection is enabled
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setError(
          "An account with this email address already exists. Please log in or reset your password."
        );
        return;
      }

      if (data.session) {
        // If auto-confirm is enabled on the Supabase project, proceed directly to onboarding
        router.push("/onboarding");
        router.refresh();
      } else {
        setVerificationSent(true);
      }
    } catch {
      setError("Network error while creating your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (verificationSent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div
          className="bg-white border border-forest/30 rounded-3xl p-8 shadow-warm text-center space-y-4"
          data-testid="verification-sent-card"
        >
          <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl text-charcoal">Verify your email address</h1>
          <p className="text-sm text-muted leading-relaxed">
            We&apos;ve sent a confirmation link to <strong className="text-charcoal">{email}</strong>. Click the link in your email to verify your account and begin setting up your flatmate compatibility profile.
          </p>
          <p className="text-xs text-muted bg-ivory p-3.5 rounded-2xl border border-border">
            Your profile starts in an <strong>unpublished draft state</strong> and will never appear in discovery until you complete onboarding and explicitly publish it.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-full bg-forest text-ivory text-xs font-medium"
            >
              Proceed to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-14 space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand text-forest text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-terracotta" />
          Private Until Published
        </span>
        <h1 className="font-serif text-3xl text-charcoal">Create your SpaceSync account</h1>
        <p className="text-xs text-muted max-w-md mx-auto">
          Start building your living preferences profile. Your profile remains private until you review and explicitly publish it.
        </p>
      </div>

      {!config.isConfigured && (
        <ConfigStatusBanner
          serviceName="Supabase Auth"
          missingVars={config.missingVars}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-4"
        data-testid="signup-form"
        noValidate
      >
        {error && (
          <div
            role="alert"
            data-testid="signup-error"
            className="p-3.5 rounded-2xl bg-terracotta/10 border border-terracotta/40 text-xs text-terracotta-dark flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="signup-first-name" className="block text-xs font-medium text-charcoal mb-1">
            First name *
          </label>
          <input
            id="signup-first-name"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Aarav"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-xs font-medium text-charcoal mb-1">
            Email address *
          </label>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="signup-password" className="block text-xs font-medium text-charcoal mb-1">
              Password *
            </label>
            <input
              id="signup-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ chars, letter & number"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label htmlFor="signup-confirm" className="block text-xs font-medium text-charcoal mb-1">
              Confirm password *
            </label>
            <input
              id="signup-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal focus:outline-none focus:border-forest"
            />
          </div>
        </div>

        <label className="flex items-start gap-2.5 text-xs text-charcoal cursor-pointer pt-2">
          <input
            id="signup-age-confirm"
            type="checkbox"
            checked={ageConfirmed18Plus}
            onChange={(e) => setAgeConfirmed18Plus(e.target.checked)}
            className="mt-0.5 rounded border-border text-forest focus:ring-forest"
          />
          <span>
            I confirm that I am <strong>18 years of age or older</strong> and agree to SpaceSync&apos;s{" "}
            <Link href="/terms" className="text-forest underline">
              Terms of Use
            </Link>
            ,{" "}
            <Link href="/privacy" className="text-forest underline">
              Privacy Policy
            </Link>
            , and{" "}
            <Link href="/guidelines" className="text-forest underline">
              Community Guidelines
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-forest hover:bg-forest-light disabled:opacity-60 text-ivory text-sm font-medium transition"
        >
          {loading ? "Creating account..." : "Create Account & Continue"}
        </button>

        <div className="pt-2 flex items-center gap-2 text-[11px] text-muted">
          <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
          <span>Creating an account does not publish your profile to discovery.</span>
        </div>
      </form>

      <p className="text-center text-xs text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-forest font-semibold underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
