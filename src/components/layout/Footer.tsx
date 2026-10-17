import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-sand/60 border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center text-ivory font-serif font-semibold text-sm">
                S
              </div>
              <span className="font-serif text-xl font-semibold text-charcoal">
                SpaceSync
              </span>
            </div>
            <p className="font-serif italic text-forest text-sm">
              &ldquo;Somewhere out there is your perfect flatmate.&rdquo;
            </p>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              SpaceSync helps students, MBA cohorts, and young professionals across Bangalore, Mumbai, Delhi NCR, and beyond find compatible people to live with through the transparent, rules-based Peace Score.
            </p>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
              Product & Compatibility
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/how-it-works" className="hover:text-charcoal transition">
                  How SpaceSync Works
                </Link>
              </li>
              <li>
                <Link href="/peace-score" className="hover:text-charcoal transition">
                  How Peace Score Works
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-charcoal transition">
                  Discover Flatmates
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-charcoal transition">
                  Pricing (Free & ₹199/mo Premium)
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-charcoal transition">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Community */}
          <div className="md:col-span-2 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
              Community
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/about" className="hover:text-charcoal transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-charcoal transition">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-charcoal transition">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal">
              Privacy & Trust
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/privacy" className="hover:text-charcoal transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-charcoal transition">
                  Terms of Use
                </Link>
              </li>
            </ul>
            <p className="text-[11px] text-muted pt-2 leading-relaxed">
              About people, living habits, and compatibility — not property brokerage and not dating. Zero fabricated profiles.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} SpaceSync. Built with honesty for peaceful shared homes.</p>
          <p>Initial focus: Bangalore · Mumbai · Delhi NCR · Open across India</p>
        </div>
      </div>
    </footer>
  );
}
