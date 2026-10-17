"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Sparkles, RefreshCw } from "lucide-react";

interface PricingActionsProps {
  isAuthenticated: boolean;
  isPremium: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  razorpayConfigured: boolean;
  missingRazorpayVars: string[];
}

export function PricingActions({
  isAuthenticated,
  isPremium,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  razorpayConfigured,
  missingRazorpayVars,
}: PricingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleStartUpgrade() {
    if (!isAuthenticated) {
      router.push("/login?redirectTo=/pricing");
      return;
    }

    if (!razorpayConfigured) {
      setFeedback({
        type: "error",
        text: `Live Razorpay checkout is not currently configured in this environment. Missing variables: ${missingRazorpayVars.join(", ")}. SpaceSync never simulates payment success.`,
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "Unable to create Razorpay order.",
        });
        return;
      }

      // If Razorpay checkout script is loaded in browser, open checkout modal
      const win = window as unknown as {
        Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
      };

      if (!win.Razorpay) {
        setFeedback({
          type: "error",
          text: "Razorpay Checkout SDK could not be loaded. Check your network connection.",
        });
        return;
      }

      const rzp = new win.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "SpaceSync Premium",
        description: "Monthly Subscription — ₹199/month",
        order_id: data.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.verified) {
            setFeedback({
              type: "success",
              text: "Payment cryptographically verified on the server! Your SpaceSync Premium entitlement is now active.",
            });
            router.refresh();
          } else {
            setFeedback({
              type: "error",
              text: verifyData.error || "Server-side payment signature verification failed.",
            });
          }
        },
        theme: {
          color: "#30483A",
        },
      });

      rzp.open();
    } catch {
      setFeedback({
        type: "error",
        text: "Network error while initiating checkout. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleCancellation(action: "cancel" | "resume") {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/payments/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error || "Could not update subscription renewal state.",
        });
        return;
      }
      setFeedback({
        type: "success",
        text: data.message,
      });
      router.refresh();
    } catch {
      setFeedback({
        type: "error",
        text: "Network error while updating subscription.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {isPremium ? (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-forest/10 border border-forest/30 text-xs text-forest font-medium flex items-center justify-between">
            <span>Active Plan: SpaceSync Premium (₹199/mo)</span>
            {currentPeriodEnd && (
              <span>
                {cancelAtPeriodEnd ? "Ends " : "Renews "}
                {new Date(currentPeriodEnd).toLocaleDateString("en-IN")}
              </span>
            )}
          </div>
          {cancelAtPeriodEnd ? (
            <button
              type="button"
              onClick={() => handleToggleCancellation("resume")}
              disabled={loading}
              className="w-full py-3 rounded-full bg-forest hover:bg-forest-light text-ivory text-sm font-medium inline-flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Resume Monthly Renewal
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleToggleCancellation("cancel")}
              disabled={loading}
              className="w-full py-3 rounded-full border border-terracotta text-terracotta-dark hover:bg-terracotta/10 text-sm font-medium transition"
            >
              Cancel Renewal at Period End
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStartUpgrade}
          disabled={loading}
          data-testid="upgrade-premium-button"
          className="w-full py-3.5 rounded-full bg-forest hover:bg-forest-light disabled:opacity-60 text-ivory text-sm font-medium inline-flex items-center justify-center gap-2 shadow-warm transition"
        >
          <Sparkles className="w-4 h-4" />
          {loading
            ? "Connecting to payment server..."
            : isAuthenticated
              ? "Upgrade to SpaceSync Premium — ₹199/mo"
              : "Sign in to Upgrade — ₹199/mo"}
        </button>
      )}

      {!razorpayConfigured && (
        <div className="p-3.5 rounded-2xl bg-sand border border-border text-[11px] text-muted leading-relaxed">
          <strong className="text-charcoal">Billing Provider Status:</strong> Razorpay credentials (
          <code className="font-mono">{missingRazorpayVars.join(", ")}</code>) are not configured in this environment. Checkout is disabled until real provider keys are supplied; client-side flags can never unlock Premium.
        </div>
      )}

      {feedback && (
        <div
          role="alert"
          className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2 ${
            feedback.type === "success"
              ? "bg-forest/10 border-forest/30 text-forest"
              : "bg-terracotta/10 border-terracotta/40 text-terracotta-dark"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-center text-xs text-muted">
          New to SpaceSync?{" "}
          <Link href="/signup" className="text-forest font-semibold underline underline-offset-4">
            Create your free profile first
          </Link>
        </p>
      )}
    </div>
  );
}
