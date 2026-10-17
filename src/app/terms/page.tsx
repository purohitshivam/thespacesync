import React from "react";

export const metadata = {
  title: "Terms of Use",
  description: "Terms and conditions governing the use of SpaceSync.",
};

export default function TermsOfUsePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="space-y-2 border-b border-border pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-forest">
          Platform Agreement
        </span>
        <h1 className="font-serif text-4xl text-charcoal">Terms of Use</h1>
        <p className="text-xs text-muted">Effective Date: October 2026</p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-7 md:p-10 shadow-warm space-y-6 text-sm text-charcoal leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl text-charcoal">1. Eligibility</h2>
          <p className="text-muted">
            You must be at least 18 years of age to create an account or use SpaceSync. By registering, you represent and warrant that all information you submit is truthful and accurate.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-charcoal">2. Nature of the Service</h2>
          <p className="text-muted">
            SpaceSync is a flatmate compatibility and introduction platform. SpaceSync is not a real-estate broker, property manager, landlord, or background-check agency. The Peace Score is a rules-based compatibility estimate based on user-supplied answers and does not constitute a guarantee or warranty of any person&apos;s character, financial reliability, or suitability as a housemate.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-charcoal">3. Authentic Profiles Only</h2>
          <p className="text-muted">
            Impersonation, fake profiles, broker spam, commercial property advertisements, and automated scraping are strictly prohibited. Accounts found violating these rules may be suspended immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-charcoal">4. Premium Subscriptions</h2>
          <p className="text-muted">
            SpaceSync offers optional Premium features at ₹199/month. Paid entitlements are activated solely upon cryptographic server-side payment verification. You may cancel renewal at any time from your account settings or pricing screen.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl text-charcoal">5. Personal Safety Precaution</h2>
          <p className="text-muted">
            Users are solely responsible for their interactions with other members. Always meet prospective flatmates in public spaces first, inspect properties in person, and verify lease agreements before transferring any funds.
          </p>
        </section>
      </div>
    </div>
  );
}
