import React from "react";
import Link from "next/link";
import { Mail, ShieldAlert, MessageCircleQuestion } from "lucide-react";

export const metadata = {
  title: "Contact & Support",
  description: "Get help with your SpaceSync account, privacy preferences, or community safety reports.",
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
          Support & Trust
        </span>
        <h1 className="font-serif text-4xl text-charcoal">Contact & Support</h1>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          Whether you need help with account settings, want to bring SpaceSync to your university or MBA cohort, or need to escalate a community safety concern, we are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border rounded-3xl p-6 shadow-warm space-y-3">
          <Mail className="w-6 h-6 text-forest" />
          <h2 className="font-serif text-xl text-charcoal">General & Account Support</h2>
          <p className="text-xs text-muted leading-relaxed">
            For account questions, onboarding help, or feedback on Peace Score dimensions:
          </p>
          <a
            href="mailto:support@spacesync.in"
            className="inline-block text-sm font-semibold text-forest underline underline-offset-4"
          >
            support@spacesync.in
          </a>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-warm space-y-3">
          <ShieldAlert className="w-6 h-6 text-terracotta" />
          <h2 className="font-serif text-xl text-charcoal">Safety & Moderation</h2>
          <p className="text-xs text-muted leading-relaxed">
            You can block or report any profile or conversation directly in the app. For urgent safety escalations:
          </p>
          <a
            href="mailto:safety@spacesync.in"
            className="inline-block text-sm font-semibold text-terracotta-dark underline underline-offset-4"
          >
            safety@spacesync.in
          </a>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-warm space-y-3">
          <MessageCircleQuestion className="w-6 h-6 text-forest" />
          <h2 className="font-serif text-xl text-charcoal">Campus & Cohort Partnerships</h2>
          <p className="text-xs text-muted leading-relaxed">
            Organising flatmate mixers for Masters&apos; Union, MBA batches, or corporate relocation groups?
          </p>
          <a
            href="mailto:cohorts@spacesync.in"
            className="inline-block text-sm font-semibold text-forest underline underline-offset-4"
          >
            cohorts@spacesync.in
          </a>
        </div>
      </div>

      <div className="bg-sand/60 border border-border rounded-3xl p-6 text-xs text-muted space-y-2">
        <p className="font-semibold text-charcoal">Need to manage your data or delete your account?</p>
        <p>
          Signed-in users can unpublish their profile, export or edit preferences, or permanently delete their account and all associated records at any time from{" "}
          <Link href="/settings" className="text-forest underline">
            Account Settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
