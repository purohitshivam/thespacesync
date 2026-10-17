import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about SpaceSync, the Peace Score, privacy, and flatmate matching.",
};

export default function FaqsPage() {
  const faqs = [
    {
      q: "What is SpaceSync?",
      a: "SpaceSync is a flatmate matchmaking platform that helps people find compatible housemates based on daily living habits, household boundaries, budget overlap, and communication styles rather than property listings.",
    },
    {
      q: "Does SpaceSync list rooms or charge brokerage?",
      a: "No. SpaceSync is not a real-estate broker or property classifieds portal. Some users on SpaceSync already lease a 2BHK/3BHK and are looking for a compatible flatmate to fill a room; others are looking to team up with a compatible flatmate first and hunt for an apartment together.",
    },
    {
      q: "How is the Peace Score calculated?",
      a: "The Peace Score is a deterministic, rules-based compatibility score (0 to 100) weighted across Lifestyle & Daily Habits (40%), Living Preferences & Budget (40%), and Personality & Communication (20%). Unanswered questions are excluded from the denominator rather than guessed, and strict deal-breakers are flagged explicitly.",
    },
    {
      q: "Is the Peace Score a guarantee that we will get along?",
      a: "No. The Peace Score is a transparent compatibility estimate designed to start honest conversations before you move in together. It is not scientifically validated psychometric testing or a guarantee of a successful flatmate relationship.",
    },
    {
      q: "Why might I see zero profiles in my city or neighbourhood?",
      a: "SpaceSync strictly prohibits dummy profiles, sample users, and fake engagement. If no eligible users have published profiles matching your current filters, we display an honest empty state.",
    },
    {
      q: "Is my profile public as soon as I sign up?",
      a: "No. When you create an account, your profile starts in a private, unpublished state. It only appears in discovery after you complete onboarding, confirm you are 18+, and explicitly click Publish.",
    },
    {
      q: "Are my phone number and email visible to other users?",
      a: "No. Your email address and personal contact details are kept private by default. You can communicate with mutual matches using our persistent in-app chat and choose whether to share additional contact details later.",
    },
    {
      q: "What is included in SpaceSync Free vs Premium (₹199/month)?",
      a: "Free includes full profile creation, discovery with city/area/budget/timeline/lifestyle filters, Peace Scores, mutual matching, and in-app messaging. Premium (₹199/month) unlocks advanced filters (dietary kitchen rules, pet preferences, WFH routine, guest policy), deeper side-by-side answer comparisons, and priority visibility.",
    },
    {
      q: "Does SpaceSync perform background checks or property verification?",
      a: "SpaceSync verifies email addresses and moderates user reports, but does not currently perform government ID background checks or physical property inspections. Always meet potential flatmates in public places and verify lease documents directly before transferring any security deposit.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Help Centre
        </span>
        <h1 className="font-serif text-4xl text-charcoal">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-muted">
          Honest answers about how SpaceSync works, how we calculate compatibility, and how we protect your privacy.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item) => (
          <div
            key={item.q}
            className="bg-white border border-border rounded-2xl p-6 shadow-warm space-y-2"
          >
            <h2 className="font-serif text-lg text-charcoal">{item.q}</h2>
            <p className="text-sm text-muted leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="bg-sand/60 border border-border rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg text-charcoal">Still have a question?</h3>
          <p className="text-xs text-muted">Reach out to our support and community moderation team.</p>
        </div>
        <Link
          href="/contact"
          className="px-5 py-2.5 rounded-full bg-forest text-ivory text-xs font-medium hover:bg-forest-light transition"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
