import React from "react";
import Link from "next/link";
import { PeaceScoreArchitectureDiagram } from "@/components/ui/OrbitalGraphics";
import { AlertTriangle, CheckCircle2, Scale, Sliders, HelpCircle } from "lucide-react";

export const metadata = {
  title: "How Peace Score Works",
  description: "Explore the deterministic, rules-based compatibility formula behind SpaceSync's Peace Score.",
};

export default function PeaceScoreExplanationPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
      <div className="space-y-4 max-w-3xl">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand text-forest text-xs font-semibold">
          <Scale className="w-3.5 h-3.5 text-terracotta" />
          Deterministic Compatibility Methodology
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-charcoal">
          How the Peace Score Works
        </h1>
        <p className="text-muted text-base leading-relaxed">
          The Peace Score is a transparent, weighted, rules-based estimate of flatmate compatibility calculated from two genuine users&apos; saved answers. It uses zero random numbers, zero black-box AI guessing, and zero hidden scores.
        </p>
      </div>

      {/* Architectural Diagram */}
      <PeaceScoreArchitectureDiagram />

      {/* Core Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <div className="flex items-center gap-2 text-forest font-semibold text-sm">
            <Sliders className="w-4 h-4 text-terracotta" />
            <span>1. Configurable Category Weights (40 / 40 / 20)</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            By default, <strong>Lifestyle & Daily Habits</strong> accounts for 40%, <strong>Living Preferences & Budget</strong> accounts for 40%, and <strong>Personality & Communication</strong> accounts for 20%. Within each category, individual questions are weighted by the average importance level (Low = 0.6×, Medium = 1.0×, High = 1.5×) selected by both users.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <div className="flex items-center gap-2 text-forest font-semibold text-sm">
            <HelpCircle className="w-4 h-4 text-terracotta" />
            <span>2. Missing Answers Excluded from Denominator</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            If either user skips an optional question, that dimension is excluded from the category denominator rather than penalising the pair or inserting a fake average. If fewer than 4 dimensions are mutually answered across both profiles, SpaceSync displays an honest <strong>Incomplete Data</strong> badge instead of a score.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <div className="flex items-center gap-2 text-forest font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-terracotta" />
            <span>3. Complementary Preferences Are Rewarded</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Having different habits does not automatically mean incompatibility! For example, a daily cook paired with someone who mostly orders in scores <strong>92/100</strong> on kitchen usage because they rarely crowd the stove at the same time. Similarly, one person working from office and one working from home complement each other&apos;s daytime space.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <div className="flex items-center gap-2 text-forest font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-terracotta" />
            <span>4. Explicit Deal-Breaker Flagging</span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Users can flag specific questions as strict deal-breakers (such as a strictly vegetarian kitchen, smoke-free indoors, or pet allergies). When a pairwise score on a designated deal-breaker falls at or below the conflict threshold (35/100), SpaceSync flags the deal-breaker explicitly and caps the overall Peace Score at 49% while showing the unpenalised score alongside it.
          </p>
        </div>
      </div>

      {/* Dimension Rule Table */}
      <div className="bg-white border border-border rounded-3xl p-7 md:p-8 shadow-warm space-y-5">
        <h2 className="font-serif text-2xl text-charcoal">
          Dimension-by-Dimension Scoring Rules
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted uppercase tracking-wider">
                <th className="py-3 pr-4">Dimension</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 pl-4">How Compatibility Is Evaluated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-charcoal">
              <tr>
                <td className="py-3 pr-4 font-medium">Monthly Budget Range</td>
                <td className="py-3 px-4 text-muted">Living (40%)</td>
                <td className="py-3 pl-4">
                  Continuous interval overlap in INR. Overlapping ranges score 80–100 based on overlap depth; disjoint budgets decay smoothly by relative percentage gap.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Preferred Neighbourhoods</td>
                <td className="py-3 px-4 text-muted">Living (40%)</td>
                <td className="py-3 pl-4">
                  Checks city match and locality intersection (e.g., Indiranagar, HSR Layout, Bandra West, Cyber City). 1+ shared locality scores 90–100.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Moving Timeline & Intent</td>
                <td className="py-3 px-4 text-muted">Living (40%)</td>
                <td className="py-3 pl-4">
                  Matches move-in windows and rewards complementary search intents (e.g., one has a flat, the other is looking for a flatmate = 100).
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Sleep, Noise & Cleanliness</td>
                <td className="py-3 px-4 text-muted">Lifestyle (40%)</td>
                <td className="py-3 pl-4">
                  Spectrum comparison across circadian schedules, acoustic preferences, and common-room tidiness standards.
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Diet, Smoking, Pets & Guests</td>
                <td className="py-3 px-4 text-muted">Lifestyle (40%)</td>
                <td className="py-3 pl-4">
                  Explicit boundary matrices (e.g., pet owner + pet lover = 100; pet owner + pet allergy = 0; strict veg kitchen + non-veg cooking = 15).
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Communication & Conflict Style</td>
                <td className="py-3 px-4 text-muted">Personality (20%)</td>
                <td className="py-3 pl-4">
                  Evaluates alignment on direct vs async house feedback, social battery recharge, and independent vs shared time.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Honest Disclaimer */}
      <div className="bg-sand/80 border border-border rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <h3 className="font-serif text-xl text-charcoal">
            An honest conversation starter — not a guarantee
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            The Peace Score is not scientifically validated psychometric testing and does not guarantee a successful flatmate relationship. Always chat, meet in a public place, and discuss lease terms directly before committing.
          </p>
        </div>
        <Link
          href="/signup"
          className="px-6 py-3 rounded-full bg-forest hover:bg-forest-light text-ivory text-sm font-medium shrink-0 transition"
        >
          Calculate Your Peace Score
        </Link>
      </div>
    </div>
  );
}
