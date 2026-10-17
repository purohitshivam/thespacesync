import React from "react";

export const metadata = {
  title: "Privacy Policy",
  description: "How SpaceSync collects, uses, protects, and lets you delete your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2 border-b border-border pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Privacy & Data Stewardship
        </span>
        <h1 className="font-serif text-4xl text-charcoal">Privacy Policy</h1>
        <p className="text-xs text-muted">Last updated: October 2026</p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-7 md:p-10 shadow-warm space-y-6 text-sm text-charcoal leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-charcoal">1. Data Minimisation Principle</h2>
          <p className="text-muted">
            SpaceSync only collects information necessary to calculate flatmate compatibility, facilitate mutual matching, and keep the community safe. We verify minimum age eligibility (18+) and store birth year rather than requiring full government identification numbers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-charcoal">2. Information You Provide</h2>
          <ul className="list-disc list-inside text-muted space-y-1">
            <li>Account credentials (email address and encrypted authentication via Supabase Auth).</li>
            <li>Basic profile details (first name, city, occupation/study context, optional bio, optional profile photo).</li>
            <li>Living, lifestyle, and communication preferences used solely to compute your Peace Score with other users.</li>
            <li>In-app messages exchanged with mutual matches and optional waitlist entries.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-charcoal">3. Default Privacy & Visibility Controls</h2>
          <p className="text-muted">
            Creating an account does not publish your profile. Your profile remains invisible to discovery until you explicitly publish it. Your email address and optional phone/handle are private by default and are never exposed on public profile cards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-charcoal">4. Row Level Security & Storage</h2>
          <p className="text-muted">
            All user data is stored in PostgreSQL protected by Supabase Row Level Security (RLS). Conversations and messages are accessible strictly to active participants of a mutual match. Safety reports are visible only to authorised moderators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-charcoal">5. Account Deletion & Right to Erasure</h2>
          <p className="text-muted">
            You can unpublish your profile or permanently delete your account at any time from your Settings page. Deleting your account cascades deletion across your profile, preferences, interests, matches, and messages.
          </p>
        </section>
      </div>
    </div>
  );
}
