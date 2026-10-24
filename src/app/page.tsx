import React from "react";
import Link from "next/link";
import { HeroMatchCard } from "@/components/ui/HeroMatchCard";
import { LocalityStrip } from "@/components/ui/LocalityStrip";
import { HomeFaqAccordion } from "@/components/ui/HomeFaqAccordion";
import {
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  Lock,
  HeartHandshake,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border bg-gradient-to-b from-ivory via-ivory to-sand/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand/80 border border-border text-xs font-medium text-forest shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              <span>People-First Flatmate Compatibility · Bengaluru, Mumbai & Delhi NCR</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-charcoal leading-[1.12] tracking-tight">
              Somewhere out there is your{" "}
              <span className="text-forest italic font-serif">perfect flatmate.</span>
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl">
              Finding a flat is only half the story — who you share the kitchen, quiet hours, and utility bills with shapes your daily peace of mind. SpaceSync matches students, MBA cohorts, and young professionals on living habits and boundaries using our transparent{" "}
              <strong className="text-charcoal font-medium">Peace Score</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-forest hover:bg-forest-light text-ivory font-medium text-sm shadow-warm transition transform hover:-translate-y-0.5"
              >
                Create Your Compatibility Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/peace-score"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-sand/70 border border-border text-charcoal font-medium text-sm transition"
              >
                How Peace Score Works
              </Link>
            </div>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted border-t border-border/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest shrink-0" />
                <span>About people & habits — not broker ads</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-terracotta shrink-0" />
                <span>Explainable 40/40/20 formula</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sage-dark shrink-0" />
                <span>Zero dummy profiles or fake data</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <HeroMatchCard />
          </div>
        </div>
      </section>

      {/* 2. ACTIVE LOCALITY CORRIDORS STRIP */}
      <LocalityStrip />

      {/* 3. THE SPLIT CONTRAST: THE GROUP CHAT CHAOS VS. SPACESYNC SANCTUARY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            The Reality of Shared Living
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
            A great balcony won&apos;t fix a 2 AM kitchen clash.
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed">
            Traditional flatmate hunting is a blind lottery. You spend hours scrolling chaotic WhatsApp groups and Facebook posts that list room rent, while hiding the everyday lifestyle habits that make or break a home.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* The Old Way: Chaotic Group Chats */}
          <div className="bg-white/70 border border-red-200/80 rounded-3xl p-7 sm:p-9 space-y-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200/60">
                <XCircle className="w-4 h-4 text-red-500" />
                <span>The Traditional Flatmate Lottery</span>
              </div>
              <h3 className="font-serif text-2xl text-charcoal">
                Scattered DMs & Unspoken Clashes
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                You meet someone off a random Facebook or Reddit thread, fall in love with the apartment layout, and move in together — only to discover irreconcilable differences within 72 hours.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-charcoal">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Answering the exact same 15 lifestyle questions in 40 different unorganized WhatsApp DMs.</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-charcoal">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Surprise dietary & kitchen conflicts (e.g. strict vegetarian kitchen vs. non-veg cooking) discovered after signing the lease.</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-charcoal">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Loud 1 AM speaker calls, unannounced overnight guests, and awkward passive-aggressive sticky notes.</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-red-50/50 border border-red-100 text-xs text-charcoal">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Your phone number exposed to brokers, commercial hostels, and unsolicited marketing lists.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-red-100 text-[11px] text-muted italic">
              Result: 11 months of domestic tension or paying a penalty to break your lease early.
            </div>
          </div>

          {/* The SpaceSync Way: Sanctuary & Harmony */}
          <div className="bg-white border-2 border-forest/60 rounded-3xl p-7 sm:p-9 space-y-6 shadow-warm-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-forest text-ivory text-[10px] font-bold uppercase tracking-widest rounded-bl-2xl">
              The SpaceSync Sanctuary
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-semibold border border-forest/20">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Transparent Domestic Harmony</span>
              </div>
              <h3 className="font-serif text-2xl text-charcoal">
                Align Habits Before Exchanging Keys
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                SpaceSync turns messy lifestyle conversations into a transparent, explainable compatibility profile. You know exactly how someone lives before you step foot in an apartment together.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-ivory border border-border/80 text-xs text-charcoal">
                  <Check className="w-4 h-4 text-forest font-bold shrink-0 mt-0.5" />
                  <span><strong>One shareable compatibility profile:</strong> Send a single link instead of re-typing your habits to every applicant.</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-ivory border border-border/80 text-xs text-charcoal">
                  <Check className="w-4 h-4 text-forest font-bold shrink-0 mt-0.5" />
                  <span><strong>Automatic deal-breaker shielding:</strong> Non-negotiables (diet, smoke-free indoor, pets) are flagged before you visit.</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-ivory border border-border/80 text-xs text-charcoal">
                  <Check className="w-4 h-4 text-forest font-bold shrink-0 mt-0.5" />
                  <span><strong>Deterministic 0–100% Peace Score:</strong> Transparent breakdown rewarding complementary daily rhythms.</span>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-ivory border border-border/80 text-xs text-charcoal">
                  <Check className="w-4 h-4 text-forest font-bold shrink-0 mt-0.5" />
                  <span><strong>Mutual sync handshake:</strong> Your phone number stays hidden; private 1-to-1 chat unlocks only upon mutual consent.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-forest">100% Free Core Profile Creation</span>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-light underline underline-offset-4"
              >
                Get Started Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE COMPATIBILITY ENGINE BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest">
            Engineered For Living Peace
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
            Inside the SpaceSync Architecture
          </h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            Every score in SpaceSync comes from documented mathematical rules and your chosen importance weights — never from black-box AI guesses.
          </p>
        </div>

        {/* The Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Tile 1: 40/40/20 Formula (Spans 7 cols) */}
          <div className="md:col-span-7 bg-white border border-border/80 rounded-3xl p-7 sm:p-8 shadow-warm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-forest bg-sand/60 px-3 py-1 rounded-full border border-border/70">
                  Weighted Engine
                </span>
                <span className="text-xs font-mono text-muted">Deterministic 40/40/20</span>
              </div>
              <h3 className="font-serif text-2xl text-charcoal">
                The Three Pillars of Home Harmony
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Compatibility isn&apos;t just one number. SpaceSync weighs your saved answers across the three pillars that govern everyday flatshares:
              </p>

              {/* Formula Progress Bars */}
              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-charcoal mb-1.5">
                    <span>Lifestyle & Daily Habits (Sleep, Cleanliness, Food, Guests)</span>
                    <strong className="text-forest">40%</strong>
                  </div>
                  <div className="w-full h-2.5 bg-sand rounded-full overflow-hidden">
                    <div className="h-full bg-forest rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-charcoal mb-1.5">
                    <span>Living Preferences & Budget (Locations, Rent, Room Type)</span>
                    <strong className="text-terracotta">40%</strong>
                  </div>
                  <div className="w-full h-2.5 bg-sand rounded-full overflow-hidden">
                    <div className="h-full bg-terracotta rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-charcoal mb-1.5">
                    <span>Personality & Communication (Conflict style, Social battery)</span>
                    <strong className="text-sage-dark">20%</strong>
                  </div>
                  <div className="w-full h-2.5 bg-sand rounded-full overflow-hidden">
                    <div className="h-full bg-sage-dark rounded-full" style={{ width: "20%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/70 text-xs text-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-forest shrink-0" />
              <span>Skipped optional questions are excluded from denominator — never guessed.</span>
            </div>
          </div>

          {/* Tile 2: Deal-Breaker Shielding (Spans 5 cols) */}
          <div className="md:col-span-5 bg-white border border-border/80 rounded-3xl p-7 sm:p-8 shadow-warm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-terracotta/15 flex items-center justify-center text-terracotta-dark">
                <ShieldCheck className="w-5 h-5 text-terracotta" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-charcoal">
                Strict Deal-Breaker Shield
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                If a non-negotiable habit (strict veg kitchen, smoke-free indoor policy, or pet allergy) is violated, SpaceSync flags it explicitly and hard-caps the Peace Score at 49%.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Zero Compromise on Hard Boundaries</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                You never waste a weekend visiting a flat where an unbendable rule is broken.
              </p>
            </div>
          </div>

          {/* Tile 3: Mutual Sync Handshake (Spans 5 cols) */}
          <div className="md:col-span-5 bg-white border border-border/80 rounded-3xl p-7 sm:p-8 shadow-warm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-forest/10 flex items-center justify-center text-forest">
                <Lock className="w-5 h-5 text-forest" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-charcoal">
                Mutual Handshake Privacy
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Nobody can slide into your messages unsolicited. A private 1-to-1 conversation unlocks only when both people review profiles and confirm mutual compatibility.
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-ivory border border-border/80 text-xs text-charcoal">
              <HeartHandshake className="w-4 h-4 text-forest shrink-0" />
              <span>Phone numbers and personal contact remain private.</span>
            </div>
          </div>

          {/* Tile 4: Complementary Habit Recognition (Spans 7 cols) */}
          <div className="md:col-span-7 bg-white border border-border/80 rounded-3xl p-7 sm:p-8 shadow-warm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-terracotta bg-terracotta/10 px-3 py-1 rounded-full border border-terracotta/20">
                  Smart Dynamics
                </span>
                <span className="text-xs text-muted">Diverse & Peaceful</span>
              </div>
              <h3 className="font-serif text-2xl text-charcoal">
                Complementary Habits Rewarded
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Being different doesn&apos;t mean incompatible. If one person loves daily home cooking while the other prefers ordering in, SpaceSync awards a 92% kitchen score because you will rarely crowd the stove at the same time.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 rounded-2xl bg-ivory border border-border/70 space-y-1">
                  <div className="font-semibold text-charcoal">Chef Flatmate</div>
                  <div className="text-[11px] text-muted">Daily evening cook · Uses kitchen 7–8 PM</div>
                </div>
                <div className="p-3 rounded-2xl bg-ivory border border-border/70 space-y-1">
                  <div className="font-semibold text-charcoal">Swiggy Flatmate</div>
                  <div className="text-[11px] text-muted">Orders meals · Zero stove competition</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/70 text-xs text-forest font-semibold flex items-center gap-1.5">
              <span>✓ Harmonious domestic coexistence by design</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THREE-STEP WORKFLOW WALKTHROUGH */}
      <section className="bg-sand/40 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest">
              From Search to Keys in 3 Steps
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
              How SpaceSync Works
            </h2>
            <p className="text-sm sm:text-base text-muted">
              Built for speed, clarity, and domestic peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/95 border border-border/80 rounded-3xl p-7 sm:p-8 space-y-4 shadow-warm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-forest text-ivory flex items-center justify-center font-serif text-base font-bold">
                  1
                </div>
                <h3 className="font-serif text-2xl text-charcoal">
                  Build Your Compatibility Card
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Answer 15 targeted questions about sleep schedules, kitchen boundaries, WFH call zones, and deal-breakers. Your profile remains in a private draft state until you choose to publish.
                </p>
              </div>
              <p className="text-xs text-forest font-medium pt-2 border-t border-border/60">
                Takes ~4 minutes · 100% free
              </p>
            </div>

            <div className="bg-white/95 border border-border/80 rounded-3xl p-7 sm:p-8 space-y-4 shadow-warm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-terracotta text-ivory flex items-center justify-center font-serif text-base font-bold">
                  2
                </div>
                <h3 className="font-serif text-2xl text-charcoal">
                  Compare Explainable Scores
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Browse genuine, published profiles in your city and preferred localities. Each profile displays a complete Peace Score breakdown showing exactly where your rhythms align.
                </p>
              </div>
              <p className="text-xs text-terracotta-dark font-medium pt-2 border-t border-border/60">
                Zero fake profiles or bots
              </p>
            </div>

            <div className="bg-white/95 border border-border/80 rounded-3xl p-7 sm:p-8 space-y-4 shadow-warm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-sage-dark text-ivory flex items-center justify-center font-serif text-base font-bold">
                  3
                </div>
                <h3 className="font-serif text-2xl text-charcoal">
                  Mutual Sync & Safe Chat
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Send an interest request with an optional note. Once both people accept, private messaging unlocks so you can plan flat visits and coordinate lease signings safely.
                </p>
              </div>
              <p className="text-xs text-charcoal font-medium pt-2 border-t border-border/60">
                Built-in block & report safeguards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING & ZERO-BROKERAGE MANIFESTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-border rounded-3xl p-8 md:p-12 shadow-warm">
          <div className="max-w-2xl space-y-3 mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest">
              Transparent, Zero-Brokerage Pricing
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
              Core matching is free forever.
            </h2>
            <p className="text-sm sm:text-base text-muted">
              We never charge brokerage, we never sell your personal data, and finding your flatmate is completely free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Free Tier */}
            <div className="rounded-2xl border border-border bg-ivory/80 p-7 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl text-charcoal">SpaceSync Core</h3>
                  <span className="font-serif text-3xl font-semibold text-charcoal">₹0</span>
                </div>
                <p className="text-xs text-muted">
                  Everything you need to create a profile, discover compatible flatmates, and message mutual matches.
                </p>
                <ul className="space-y-2.5 text-sm text-charcoal pt-2">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-forest shrink-0" />
                    <span>Complete compatibility profile & deal-breaker screening</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-forest shrink-0" />
                    <span>City, area, budget, and move-in timeline filters</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-forest shrink-0" />
                    <span>Peace Score summary & 3 category breakdowns</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-forest shrink-0" />
                    <span>Mutual matching & persistent 1-to-1 in-app messaging</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="w-full py-3.5 rounded-full border-2 border-forest text-forest hover:bg-forest hover:text-ivory text-center text-sm font-semibold transition"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="rounded-2xl border-2 border-forest bg-white p-7 sm:p-8 flex flex-col justify-between space-y-6 relative shadow-warm">
              <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-forest text-ivory text-[11px] font-semibold uppercase tracking-wider">
                Optional Power Filter
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
                  For flatmate seekers on a tight relocation countdown who want granular diet, pet, and habit comparisons.
                </p>
                <ul className="space-y-2.5 text-sm text-charcoal pt-2">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>Everything in Core Free</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>Advanced lifestyle filters (dietary kitchen rules, pets, WFH routine)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>Side-by-side answer comparisons before expressing interest</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>Priority visibility badge in city discovery results</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="w-full py-3.5 rounded-full bg-forest hover:bg-forest-light text-ivory text-center text-sm font-semibold shadow-warm transition"
              >
                View Premium Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            Clear Answers
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted">
            Everything you need to know about SpaceSync, safety, and compatibility.
          </p>
        </div>

        <HomeFaqAccordion />
      </section>

      {/* 8. FINAL HIGH-CONVERTING CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-forest-dark via-forest to-forest text-ivory rounded-3xl p-8 sm:p-14 text-center space-y-8 shadow-warm-lg relative overflow-hidden">
          {/* Subtle background ambient rings */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full border border-ivory/10 pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border border-ivory/10 pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ivory/10 text-xs font-medium text-sage-light border border-ivory/20">
              <Sparkles className="w-3.5 h-3.5 text-terracotta-light" />
              <span>Begin Your Search Today</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ivory leading-tight">
              Stop rolling the dice on who you live with.
            </h2>
            <p className="text-sm sm:text-base text-ivory/80 leading-relaxed max-w-xl mx-auto">
              Find someone who respects your quiet hours, kitchen boundaries, and daily peace of mind. Takes under 4 minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-ivory hover:bg-sand text-forest font-semibold text-sm shadow-warm transition transform hover:-translate-y-0.5"
            >
              Create Your Free Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/peace-score"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-ivory/30 hover:bg-ivory/10 text-ivory font-medium text-sm transition"
            >
              Explore Peace Score Engine
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-ivory/70 border-t border-ivory/15">
            <span>✓ 100% Free Core Profile</span>
            <span>✓ Takes 4 Minutes</span>
            <span>✓ Zero Brokerage or Dummy Profiles</span>
          </div>
        </div>
      </section>
    </div>
  );
}
