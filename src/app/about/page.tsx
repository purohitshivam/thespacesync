import React from "react";
import Link from "next/link";
import { OrbitalIllustration } from "@/components/ui/OrbitalGraphics";
import { Heart, MapPin, Users, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "About SpaceSync",
  description: "Why we built SpaceSync: helping students, MBA cohorts, and young professionals find compatible flatmates.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            Our Story & Mission
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal">
            Home feels better when your rhythms align.
          </h1>
          <p className="text-muted text-base leading-relaxed">
            SpaceSync was born out of a recurring observation among students, MBA cohorts, and young professionals relocating to Bangalore, Mumbai, and Delhi NCR: people spend weeks inspecting apartments, yet spend ten minutes deciding who they will live with for the next eleven months.
          </p>
        </div>
        <div className="md:col-span-4 flex justify-center">
          <OrbitalIllustration className="w-44 h-44" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <Users className="w-6 h-6 text-forest" />
          <h2 className="font-serif text-xl text-charcoal">Who We Serve</h2>
          <p className="text-xs text-muted leading-relaxed">
            Undergraduate and postgraduate students, MBA cohorts (including Masters&apos; Union and campus communities), young professionals starting new roles, and anyone relocating who cares deeply about peaceful shared living.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <MapPin className="w-6 h-6 text-terracotta" />
          <h2 className="font-serif text-xl text-charcoal">Where We Focus</h2>
          <p className="text-xs text-muted leading-relaxed">
            Our initial focus is on high-relocation neighbourhoods in <strong>Bangalore</strong>, <strong>Mumbai</strong>, and <strong>Delhi NCR</strong> (Gurgaon, South Delhi, Noida), while remaining open to flatmates across Pune, Hyderabad, Chennai, and other cities.
          </p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-7 shadow-warm space-y-3">
          <ShieldCheck className="w-6 h-6 text-forest" />
          <h2 className="font-serif text-xl text-charcoal">What We Are Not</h2>
          <p className="text-xs text-muted leading-relaxed">
            SpaceSync is not a real-estate brokerage, not a property classifieds portal, and not a dating app. We never manufacture fake profiles or inflate numbers to make a city look busier than it is.
          </p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-3xl p-8 md:p-10 shadow-warm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-forest">
          <Heart className="w-4 h-4 text-terracotta" />
          <span>Our Product Principles</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
          Built on transparency and consent
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-sm text-muted leading-relaxed">
          <p>
            <strong className="text-charcoal">1. Honesty over hype:</strong> If a neighbourhood has zero published profiles today, we tell you honestly rather than displaying stock photos or dummy accounts.
          </p>
          <p>
            <strong className="text-charcoal">2. Explainable compatibility:</strong> Every Peace Score comes with a full breakdown of similarities, complementary habits, and potential friction points.
          </p>
          <p>
            <strong className="text-charcoal">3. Respect for differences:</strong> Night owls and early birds, or introverts and extroverts, can be wonderful housemates when expectations are set early.
          </p>
          <p>
            <strong className="text-charcoal">4. Accessible core experience:</strong> Profile creation, discovery, mutual matching, and messaging are free for everyone.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest hover:bg-forest-light text-ivory text-sm font-medium transition"
          >
            Join SpaceSync
          </Link>
        </div>
      </div>
    </div>
  );
}
