import React from "react";
import Link from "next/link";
import { PeaceScoreArchitectureDiagram } from "@/components/ui/OrbitalGraphics";
import { HeroMatchCard } from "@/components/ui/HeroMatchCard";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import {
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  MessageSquare,
  Compass,
  Check,
  ArrowRight,
  Lock,
  Scale,
  HeartHandshake,
  Clock,
  Utensils,
  MessageCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-24 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border bg-gradient-to-b from-ivory via-ivory to-sand/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand border border-border text-xs font-medium text-forest">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              <span>People-First Flatmate Compatibility · Bangalore, Mumbai & Delhi NCR</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-[1.12] tracking-tight">
              Somewhere out there is your{" "}
              <span className="text-forest italic">perfect flatmate.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl">
              Finding a flat is only half the story — who you share the kitchen, quiet hours, and utility bills with shapes your daily peace of mind. SpaceSync matches students, MBA cohorts, and young professionals on living habits and household boundaries using our transparent{" "}
              <strong className="text-charcoal font-medium">Peace Score</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-forest hover:bg-forest-light text-ivory font-medium text-sm shadow-warm transition"
              >
                Create Your Compatibility Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/peace-score"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-sand border border-border text-charcoal font-medium text-sm transition"
              >
                How Peace Score Works
              </Link>
            </div>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted border-t border-border/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest shrink-0" />
                <span>About people & habits — not broker listings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-terracotta shrink-0" />
                <span>Explainable rules-based Peace Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sage shrink-0" />
                <span>Zero dummy profiles or fake social proof</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <HeroMatchCard />
          </div>
        </div>
      </section>

      {/* 2. THE FLATMATE COMPATIBILITY PROBLEM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            Why Flatshares Break Down
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
            A great balcony won&apos;t fix a 2 AM kitchen clash.
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed">
            Traditional listing portals and chaotic Facebook or WhatsApp threads focus almost entirely on rent and square footage. Yet most flatshare tension comes down to unspoken daily habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group bg-white/90 backdrop-blur-sm border border-border/80 hover:border-forest/40 rounded-3xl p-7 shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-sand/80 flex items-center justify-center text-forest group-hover:scale-105 transition">
                  <Clock className="w-5 h-5 text-forest" />
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-muted bg-sand/50 px-2.5 py-1 rounded-full border border-border/60">
                  Friction #1
                </span>
              </div>
              <h3 className="font-serif text-xl text-charcoal">
                Unaligned Daily Rhythms
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Early-morning commuters and late-night coders can live together peacefully — but only when quiet hours, alarm routines, and WFH call zones are clear upfront.
              </p>
            </div>
            <div className="pt-3 border-t border-border/60">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ivory text-[11px] font-medium text-forest border border-border/60">
                <span>🌙 Quiet Hours: 11 PM vs 2 AM clash</span>
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-sm border border-border/80 hover:border-terracotta/40 rounded-3xl p-7 shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-terracotta/15 flex items-center justify-center text-terracotta group-hover:scale-105 transition">
                  <Utensils className="w-5 h-5 text-terracotta-dark" />
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-full border border-terracotta/20">
                  Deal-Breaker
                </span>
              </div>
              <h3 className="font-serif text-xl text-charcoal">
                Kitchen, Guests & Upkeep
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                From strictly vegetarian utensils and shared househelp budgets to weekend overnight visitors, surfacing non-negotiables early prevents awkward conversations later.
              </p>
            </div>
            <div className="pt-3 border-t border-border/60">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ivory text-[11px] font-medium text-terracotta-dark border border-border/60">
                <span>🥗 Veg Kitchen & Shared Cleaning</span>
              </div>
            </div>
          </div>

          <div className="group bg-white/90 backdrop-blur-sm border border-border/80 hover:border-sage-dark/40 rounded-3xl p-7 shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-sage/20 flex items-center justify-center text-sage-dark group-hover:scale-105 transition">
                  <MessageCircle className="w-5 h-5 text-sage-dark" />
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-muted bg-sand/50 px-2.5 py-1 rounded-full border border-border/60">
                  Friction #3
                </span>
              </div>
              <h3 className="font-serif text-xl text-charcoal">
                Communication Styles
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Some people prefer direct in-the-moment feedback; others prefer a polite WhatsApp message first. Knowing how your flatmate communicates keeps home calm.
              </p>
            </div>
            <div className="pt-3 border-t border-border/60">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ivory text-[11px] font-medium text-charcoal border border-border/60">
                <span>💬 Spoken feedback vs Text notice</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREE-STEP PRODUCT EXPLANATION */}
      <section className="bg-sand/50 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest">
              Simple Three-Step Workflow
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
              How SpaceSync Works
            </h2>
            <p className="text-sm sm:text-base text-muted">
              No endless swiping, no broker spam, and no public exposure of your phone number.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-ivory border border-border rounded-3xl p-7 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-forest text-ivory text-xs font-semibold">
                Step 1
              </span>
              <h3 className="font-serif text-2xl text-charcoal">
                Complete Your Living Profile
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Answer concise questions across Lifestyle (sleep, cleanliness, diet, guests), Living Preferences (budget range, neighbourhoods, timeline), and Communication. Mark what matters most and flag any strict deal-breakers.
              </p>
              <p className="text-xs text-forest font-medium">
                Your profile stays private until you explicitly review and publish it.
              </p>
            </div>

            <div className="bg-ivory border border-border rounded-3xl p-7 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-terracotta text-ivory text-xs font-semibold">
                Step 2
              </span>
              <h3 className="font-serif text-2xl text-charcoal">
                Compare Explainable Peace Scores
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Explore genuine, published profiles in your city. Every profile shows a transparent Peace Score breakdown highlighting where you align, where you complement each other, and which differences to discuss.
              </p>
              <p className="text-xs text-terracotta-dark font-medium">
                Missing answers are excluded from the denominator — never guessed.
              </p>
            </div>

            <div className="bg-ivory border border-border rounded-3xl p-7 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-sage text-ivory text-xs font-semibold">
                Step 3
              </span>
              <h3 className="font-serif text-2xl text-charcoal">
                Match Mutually & Chat Safely
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Express interest with an optional note. When both people express interest, a mutual match unlocks a private one-to-one conversation right inside SpaceSync so you can coordinate flat visits or lease plans.
              </p>
              <p className="text-xs text-charcoal font-medium">
                Built-in block, report, and privacy controls at every step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ILLUSTRATIVE PEACE SCORE EXPLANATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            Transparent Compatibility Engine
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
            Inside the Peace Score Formula
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Below is an architectural illustration of how SpaceSync calculates compatibility between two profiles. Unlike black-box algorithms, every point in your Peace Score comes from documented rules and your chosen importance weights.
          </p>
        </div>

        <PeaceScoreArchitectureDiagram />
      </section>

      {/* 5. PRODUCT FEATURE OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest">
            Thoughtful Platform Capabilities
          </span>
          <h2 className="font-serif text-3xl text-charcoal">
            Everything needed to find a compatible housemate
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-border rounded-3xl p-6 space-y-2.5">
            <Compass className="w-6 h-6 text-forest" />
            <h3 className="font-serif text-lg text-charcoal">City & Neighbourhood Filters</h3>
            <p className="text-xs text-muted leading-relaxed">
              Filter by city (Bangalore, Mumbai, Delhi NCR, and more), overlapping monthly budget, move-in window, and shortlisted localities.
            </p>
          </div>

          <div className="bg-white border border-border rounded-3xl p-6 space-y-2.5">
            <Scale className="w-6 h-6 text-terracotta" />
            <h3 className="font-serif text-lg text-charcoal">Deal-Breaker Protection</h3>
            <p className="text-xs text-muted leading-relaxed">
              Designate strict non-negotiables (such as indoor smoking, kitchen dietary rules, or pet allergies) so conflicts are flagged immediately.
            </p>
          </div>

          <div className="bg-white border border-border rounded-3xl p-6 space-y-2.5">
            <SlidersHorizontal className="w-6 h-6 text-forest" />
            <h3 className="font-serif text-lg text-charcoal">Complementary Habit Recognition</h3>
            <p className="text-xs text-muted leading-relaxed">
              Different doesn&apos;t always mean incompatible. A daily cook and someone who orders in rarely crowd the stove — our rules engine recognises complementary habits.
            </p>
          </div>

          <div className="bg-white border border-border rounded-3xl p-6 space-y-2.5">
            <HeartHandshake className="w-6 h-6 text-terracotta" />
            <h3 className="font-serif text-lg text-charcoal">Mutual-Only Connections</h3>
            <p className="text-xs text-muted leading-relaxed">
              Nobody can message you unsolicited. A conversation opens only when both people review each other&apos;s profile and confirm mutual interest.
            </p>
          </div>

          <div className="bg-white border border-border rounded-3xl p-6 space-y-2.5">
            <MessageSquare className="w-6 h-6 text-forest" />
            <h3 className="font-serif text-lg text-charcoal">Persistent In-App Chat</h3>
            <p className="text-xs text-muted leading-relaxed">
              Discuss flat hunting, existing rooms, and house norms inside SpaceSync before deciding whether to exchange personal phone numbers.
            </p>
          </div>

          <div className="bg-white border border-border rounded-3xl p-6 space-y-2.5">
            <Lock className="w-6 h-6 text-terracotta" />
            <h3 className="font-serif text-lg text-charcoal">Granular Privacy Controls</h3>
            <p className="text-xs text-muted leading-relaxed">
              Unpublish your profile anytime once you find a flatmate, hide workplace/institution names if preferred, or delete your account permanently.
            </p>
          </div>
        </div>
      </section>

      {/* 6. PRICING PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-border rounded-3xl p-8 md:p-12 shadow-warm">
          <div className="max-w-2xl space-y-3 mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest">
              Simple, Fair Pricing
            </span>
            <h2 className="font-serif text-3xl text-charcoal">
              Core matching is free. Upgrade when you want deeper filters.
            </h2>
            <p className="text-sm text-muted">
              Creating your profile, browsing eligible flatmates, matching mutually, and messaging are completely free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="rounded-2xl border border-border bg-ivory p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl text-charcoal">SpaceSync Core</h3>
                  <span className="font-serif text-3xl font-semibold text-charcoal">₹0</span>
                </div>
                <p className="text-xs text-muted">
                  Everything needed to create a profile, discover compatible people, and chat with mutual matches.
                </p>
                <ul className="space-y-2.5 text-sm text-charcoal pt-2">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-forest shrink-0" />
                    <span>Complete compatibility profile & deal-breakers</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-forest shrink-0" />
                    <span>City, area, budget, timeline & basic lifestyle filters</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-forest shrink-0" />
                    <span>Peace Score summary & category scores</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-forest shrink-0" />
                    <span>Mutual matching & persistent 1-to-1 messaging</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="w-full py-3 rounded-full border border-forest text-forest hover:bg-forest hover:text-ivory text-center text-sm font-medium transition"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="rounded-2xl border-2 border-forest bg-ivory p-7 flex flex-col justify-between space-y-6 relative">
              <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-forest text-ivory text-[11px] font-semibold uppercase tracking-wider">
                Optional Upgrade
              </span>
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl text-charcoal">SpaceSync Premium</h3>
                  <div>
                    <span className="font-serif text-3xl font-semibold text-forest">₹199</span>
                    <span className="text-xs text-muted"> / month</span>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  For flatmate seekers on a tight relocation deadline who want granular filtering and side-by-side answer comparisons.
                </p>
                <ul className="space-y-2.5 text-sm text-charcoal pt-2">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>Everything in Core Free</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>Advanced filters (dietary kitchen rules, pet preferences, WFH routine, guest policy)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>Deeper compatibility insights with side-by-side answer comparisons</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>Priority visibility badge in discovery results</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="w-full py-3 rounded-full bg-forest hover:bg-forest-light text-ivory text-center text-sm font-medium transition"
              >
                Explore Pricing & Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SAFETY AND PRIVACY MESSAGING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest text-ivory rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ivory/10 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-terracotta-light" />
              <span>Honest Safety & Privacy Standards</span>
            </div>
            <h2 className="font-serif text-3xl text-ivory">
              Designed for privacy, consent, and transparency.
            </h2>
            <p className="text-sm text-ivory/80 leading-relaxed">
              Your profile stays unpublished until you choose to make it visible. Personal contact details remain private by default, and messaging requires mutual interest. We also believe in total honesty: SpaceSync verifies email addresses and moderates community reports, and we encourage flatmates to meet in public spaces and conduct standard landlord/ID checks before signing a lease.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href="/guidelines"
              className="px-6 py-3 rounded-full bg-ivory text-forest text-center text-sm font-semibold hover:bg-sand transition"
            >
              Read Community Guidelines
            </Link>
            <Link
              href="/privacy"
              className="px-6 py-3 rounded-full border border-ivory/30 text-ivory text-center text-sm font-medium hover:bg-ivory/10 transition"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FAQS PREVIEW & WAITLIST */}
      <section id="waitlist" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4 text-center">
          <h2 className="font-serif text-3xl text-charcoal">Common Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="font-serif text-base text-charcoal mb-1.5">
                Does SpaceSync list properties or charge brokerage?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                No. SpaceSync is strictly about matching compatible people to live with — either to team up and hunt for a flat together, or to invite a compatible flatmate into a shared apartment you already lease.
              </p>
            </div>
            <div className="bg-white border border-border rounded-2xl p-5">
              <h3 className="font-serif text-base text-charcoal mb-1.5">
                Why might I see an empty state in my city?
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                We never fabricate dummy profiles or seed fake users. If no eligible profiles match your filters yet, we show an honest empty state and encourage you to invite your cohort or join the city launch list.
              </p>
            </div>
          </div>
          <div className="pt-2">
            <Link
              href="/faqs"
              className="text-xs font-semibold text-forest underline underline-offset-4"
            >
              View all Frequently Asked Questions →
            </Link>
          </div>
        </div>

        <WaitlistForm />
      </section>
    </div>
  );
}
