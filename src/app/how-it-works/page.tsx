import React from "react";
import Link from "next/link";
import { OrbitalIllustration } from "@/components/ui/OrbitalGraphics";
import { ArrowRight, CheckCircle2, Shield, Sparkles, MessageSquare } from "lucide-react";

export const metadata = {
  title: "How SpaceSync Works",
  description: "Learn how SpaceSync helps you find a compatible flatmate through structured living preferences and mutual matching.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Register & Verify Your Account",
      body: "Sign up with your email address and confirm that you are 18 years or older. Creating an account never automatically exposes your profile to discovery.",
      highlights: [
        "Email verification via Supabase Auth",
        "Unpublished draft state by default",
        "Personal contact details kept private",
      ],
    },
    {
      num: "02",
      title: "Complete Guided Onboarding",
      body: "Step through concise questions covering your basic context, daily lifestyle habits, personality and communication style, monthly budget range, and preferred neighbourhoods.",
      highlights: [
        "Progress automatically saved between sessions",
        "Mark low, medium, or high importance per dimension",
        "Flag strict non-negotiable deal-breakers",
      ],
    },
    {
      num: "03",
      title: "Review & Explicitly Publish",
      body: "Inspect how your profile looks and verify your preferences before toggling your profile live for discovery. You can pause or unpublish your visibility at any time.",
      highlights: [
        "Explicit consent before appearing in discovery",
        "Control whether institution/company name is shown",
        "Edit answers anytime as your plans evolve",
      ],
    },
    {
      num: "04",
      title: "Explore Compatible Profiles & Peace Scores",
      body: "Filter genuine, published profiles by city (Bangalore, Mumbai, Delhi NCR, and beyond), locality, budget overlap, and move-in timeline. View an explainable Peace Score for every profile.",
      highlights: [
        "Deterministic 0–100 compatibility score",
        "Clear indicator of data completeness",
        "Highlights both shared habits and differences to discuss",
      ],
    },
    {
      num: "05",
      title: "Match Mutually & Message Securely",
      body: "Express interest in flatmates who fit your rhythm. When interest is mutual, SpaceSync opens a private one-to-one conversation so you can discuss apartments, house norms, and next steps.",
      highlights: [
        "No unsolicited DMs from unmatched users",
        "Real-time persistent in-app chat",
        "One-click block and report safety tools",
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand text-forest text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            Product Walkthrough
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal">
            How SpaceSync Works
          </h1>
          <p className="text-muted text-base leading-relaxed">
            SpaceSync is built around a simple premise: living peacefully in a shared flat depends on aligning daily habits, boundaries, and communication before you move in together.
          </p>
        </div>
        <div className="md:col-span-4 flex justify-center">
          <OrbitalIllustration className="w-44 h-44" />
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
          >
            <div className="md:col-span-2">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sand font-serif text-xl font-semibold text-forest">
                {step.num}
              </span>
            </div>
            <div className="md:col-span-10 space-y-3">
              <h2 className="font-serif text-2xl text-charcoal">{step.title}</h2>
              <p className="text-sm text-muted leading-relaxed">{step.body}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                {step.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-2 text-xs text-charcoal bg-ivory px-3 py-2 rounded-xl border border-border"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-sand/70 border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest">
            <Shield className="w-4 h-4 text-terracotta" />
            <span>Our Zero-Dummy-Profile Commitment</span>
          </div>
          <h3 className="font-serif text-2xl text-charcoal">
            Honest discovery, even when your city cohort is just getting started.
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            We never populate SpaceSync with fake flatmates, bots, or invented messages. Every person you see in discovery has registered and explicitly published their profile.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest hover:bg-forest-light text-ivory text-sm font-medium transition"
          >
            Start Your Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/peace-score"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-border text-charcoal text-sm font-medium hover:bg-ivory transition"
          >
            <MessageSquare className="w-4 h-4" />
            Peace Score Rules
          </Link>
        </div>
      </div>
    </div>
  );
}
