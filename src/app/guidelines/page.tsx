import React from "react";
import Link from "next/link";
import { ShieldCheck, HeartHandshake, Ban, AlertOctagon } from "lucide-react";

export const metadata = {
  title: "Community Guidelines",
  description: "Our standards for respectful, honest, and inclusive flatmate discovery on SpaceSync.",
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Shared Home Etiquette
        </span>
        <h1 className="font-serif text-4xl text-charcoal">Community Guidelines</h1>
        <p className="text-sm text-muted leading-relaxed">
          SpaceSync exists to help people build peaceful, respectful homes together. Everyone on the platform agrees to uphold these four commitments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <HeartHandshake className="w-6 h-6 text-forest" />
          <h2 className="font-serif text-xl text-charcoal">1. Be Honest About Your Habits</h2>
          <p className="text-xs text-muted leading-relaxed">
            There are no &ldquo;right&rdquo; or &ldquo;wrong&rdquo; answers in onboarding. Whether you are a night owl or an early riser, a daily cook or someone who orders in, honesty ensures your Peace Score reflects reality.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <ShieldCheck className="w-6 h-6 text-terracotta" />
          <h2 className="font-serif text-xl text-charcoal">2. Keep It Focused on Flatsharing</h2>
          <p className="text-xs text-muted leading-relaxed">
            SpaceSync is not a dating app and not a real-estate brokerage portal. Use introductions and chat strictly to discuss flatmate compatibility, neighbourhoods, and shared housing plans.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <Ban className="w-6 h-6 text-forest" />
          <h2 className="font-serif text-xl text-charcoal">3. Zero Tolerance for Harassment or Bias</h2>
          <p className="text-xs text-muted leading-relaxed">
            Abusive language, harassment, hate speech, or pressure to share private off-platform contact details will result in immediate account suspension. While personal kitchen/smoke/pet boundaries are normal, treat every person with dignity.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <AlertOctagon className="w-6 h-6 text-terracotta" />
          <h2 className="font-serif text-xl text-charcoal">4. Never Send Advance Money Sight-Unseen</h2>
          <p className="text-xs text-muted leading-relaxed">
            Never pay &ldquo;visiting fees&rdquo; or token deposits before meeting a flatmate in person, visiting the flat, and verifying the landlord/lease paperwork. Report any suspicious financial request immediately.
          </p>
        </div>
      </div>

      <div className="bg-sand/70 border border-border rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-charcoal">
          See something that violates these guidelines? Use the <strong>Report</strong> or <strong>Block</strong> button on any profile or chat screen, or contact our moderation team.
        </p>
        <Link
          href="/contact"
          className="px-5 py-2.5 rounded-full bg-forest text-ivory text-xs font-medium shrink-0"
        >
          Contact Moderation
        </Link>
      </div>
    </div>
  );
}
