import React from "react";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRazorpayConfigStatus } from "@/lib/env";
import { evaluateSubscriptionEntitlements } from "@/lib/entitlements";
import { PricingActions } from "@/components/pricing/PricingActions";
import { Check, Minus, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = {
  title: "Pricing — Free & ₹199/month Premium",
  description: "SpaceSync core flatmate matching is free. Upgrade to Premium at ₹199/month for advanced filters, deeper compatibility insights, and priority visibility.",
};

export default async function PricingPage() {
  const supabase = await createSupabaseServerClient();
  const razorpayStatus = getRazorpayConfigStatus();

  let isAuthenticated = false;
  let entitlements = evaluateSubscriptionEntitlements(null);

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      isAuthenticated = true;
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      entitlements = evaluateSubscriptionEntitlements(sub);
    }
  }

  const comparisonRows = [
    {
      feature: "Guided compatibility profile & deal-breakers",
      free: "Included",
      premium: "Included",
    },
    {
      feature: "City, neighbourhood, budget & timeline discovery filters",
      free: "Included",
      premium: "Included",
    },
    {
      feature: "Basic lifestyle filters (sleep, cleanliness, smoking)",
      free: "Included",
      premium: "Included",
    },
    {
      feature: "Explainable Peace Score (0–100) & category pillars",
      free: "Included",
      premium: "Included",
    },
    {
      feature: "Mutual matching & persistent real-time 1-to-1 chat",
      free: "Included",
      premium: "Included",
    },
    {
      feature: "Safety tools (blocking, reporting, visibility controls)",
      free: "Included",
      premium: "Included",
    },
    {
      feature: "Advanced filters (kitchen diet, pets, WFH routine, guest policy)",
      free: false,
      premium: "Included",
    },
    {
      feature: "Side-by-side answer comparison on every scored question",
      free: false,
      premium: "Included",
    },
    {
      feature: "Priority visibility badge in discovery results",
      free: false,
      premium: "Included",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sand text-forest text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-terracotta" />
          Transparent Freemium Model
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-charcoal">
          Core flatmate matching is free.
        </h1>
        <p className="text-muted text-base leading-relaxed">
          We never lock basic messages or mutual matches behind a paywall. Optional SpaceSync Premium at{" "}
          <strong className="text-charcoal">₹199/month</strong> gives flatmate seekers on a tight move-in timeline granular filters and deeper side-by-side compatibility insights.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Card */}
        <div className="bg-white border border-border rounded-3xl p-8 shadow-warm flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Always Free
                </span>
                <h2 className="font-serif text-3xl text-charcoal mt-1">SpaceSync Core</h2>
              </div>
              <div className="text-right">
                <span className="font-serif text-4xl font-semibold text-charcoal">₹0</span>
                <span className="block text-xs text-muted">Forever</span>
              </div>
            </div>

            <p className="text-sm text-muted leading-relaxed">
              Ideal for students and professionals exploring compatible flatmates in their city.
            </p>

            <ul className="space-y-3 text-sm text-charcoal pt-3 border-t border-border">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-forest shrink-0" />
                <span>Full onboarding & preference importance weights</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-forest shrink-0" />
                <span>Discover eligible profiles in Bangalore, Mumbai, Delhi NCR & more</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-forest shrink-0" />
                <span>Deterministic Peace Score & deal-breaker alerts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-forest shrink-0" />
                <span>Express interest, match mutually & chat in-app</span>
              </li>
            </ul>
          </div>

          <Link
            href={isAuthenticated ? "/discover" : "/signup"}
            className="w-full py-3.5 rounded-full border border-forest text-forest hover:bg-forest hover:text-ivory text-center text-sm font-medium transition"
          >
            {isAuthenticated ? "Go to Discovery" : "Create Free Account"}
          </Link>
        </div>

        {/* Premium Card */}
        <div className="bg-white border-2 border-forest rounded-3xl p-8 shadow-warm-lg flex flex-col justify-between space-y-8 relative">
          <span className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-forest text-ivory text-xs font-semibold">
            ₹199 / month
          </span>

          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                  Power Search & Deep Insights
                </span>
                <h2 className="font-serif text-3xl text-charcoal mt-1">SpaceSync Premium</h2>
              </div>
              <div className="text-right">
                <span className="font-serif text-4xl font-semibold text-forest">₹199</span>
                <span className="block text-xs text-muted">per month</span>
              </div>
            </div>

            <p className="text-sm text-muted leading-relaxed">
              Built for relocations with specific kitchen, pet, guest, or work-from-home criteria.
            </p>

            <ul className="space-y-3 text-sm text-charcoal pt-3 border-t border-border">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-terracotta shrink-0" />
                <span>Everything in SpaceSync Core</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-terracotta shrink-0" />
                <span>
                  <strong>Advanced Discovery Filters:</strong> Filter by dietary kitchen rules, pet preferences, WFH routine, and overnight guest policy
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-terracotta shrink-0" />
                <span>
                  <strong>Deeper Compatibility Insights:</strong> Side-by-side answer comparison across every scored Peace Score question
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-terracotta shrink-0" />
                <span>
                  <strong>Priority Visibility:</strong> Highlighted badge in discovery results
                </span>
              </li>
            </ul>
          </div>

          <PricingActions
            isAuthenticated={isAuthenticated}
            isPremium={entitlements.isPremium}
            cancelAtPeriodEnd={entitlements.cancelAtPeriodEnd}
            currentPeriodEnd={entitlements.currentPeriodEnd}
            razorpayConfigured={razorpayStatus.isConfigured}
            missingRazorpayVars={razorpayStatus.missingVars}
          />
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white border border-border rounded-3xl p-6 md:p-10 shadow-warm space-y-6">
        <h2 className="font-serif text-2xl text-charcoal">Full Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                <th className="py-3.5 pr-4">Capability</th>
                <th className="py-3.5 px-4">Free (₹0)</th>
                <th className="py-3.5 pl-4 text-forest">Premium (₹199/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonRows.map((row) => (
                <tr key={row.feature}>
                  <td className="py-3.5 pr-4 font-medium text-charcoal">{row.feature}</td>
                  <td className="py-3.5 px-4 text-muted">
                    {row.free ? (
                      <span className="inline-flex items-center gap-1.5 text-charcoal">
                        <Check className="w-4 h-4 text-forest" />
                        {row.free}
                      </span>
                    ) : (
                      <Minus className="w-4 h-4 text-muted" />
                    )}
                  </td>
                  <td className="py-3.5 pl-4 font-medium text-forest">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-terracotta" />
                      {row.premium}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-border flex items-center gap-2 text-xs text-muted">
          <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
          <span>
            All payments are verified server-side via HMAC-SHA256 signatures and idempotent webhooks. Cancel renewal anytime with one click.
          </span>
        </div>
      </div>
    </div>
  );
}
