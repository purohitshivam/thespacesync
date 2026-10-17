import React from "react";
import Link from "next/link";
import { OrbitalIllustration } from "@/components/ui/OrbitalGraphics";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="flex justify-center">
        <OrbitalIllustration className="w-40 h-40" />
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl text-charcoal">
        Page outside our orbit
      </h1>
      <p className="text-sm text-muted leading-relaxed">
        The page or profile you are looking for does not exist, has been unpublished, or is no longer accessible.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/discover"
          className="px-6 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold hover:bg-forest-light transition"
        >
          Go to Discovery
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full border border-border bg-white text-charcoal text-xs font-medium hover:bg-sand transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
