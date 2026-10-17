import React from "react";
import Link from "next/link";
import { Compass, Sparkles, SlidersHorizontal, Share2 } from "lucide-react";

/**
 * Warm abstract orbital SVG graphic combining domestic geometry with gentle celestial orbits.
 * Strictly abstract — never depicts fabricated people or fake profile photographs.
 */
export function OrbitalIllustration({ className = "w-64 h-64" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft warm background halo */}
      <circle cx="160" cy="160" r="136" fill="#EEE5D8" fillOpacity="0.6" />
      {/* Outer dashed orbit */}
      <circle
        cx="160"
        cy="160"
        r="122"
        stroke="#879783"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        strokeOpacity="0.65"
      />
      {/* Tilted elliptical orbit */}
      <ellipse
        cx="160"
        cy="160"
        rx="105"
        ry="58"
        transform="rotate(-24 160 160)"
        stroke="#30483A"
        strokeWidth="1.5"
        strokeOpacity="0.28"
      />
      <ellipse
        cx="160"
        cy="160"
        rx="105"
        ry="58"
        transform="rotate(32 160 160)"
        stroke="#C77D61"
        strokeWidth="1.5"
        strokeOpacity="0.32"
      />
      {/* Inner sanctuary circle */}
      <circle cx="160" cy="160" r="56" fill="#FAF7F1" stroke="#E7E0D5" strokeWidth="2" />
      {/* Abstract home roofline + hearth inside center */}
      <path
        d="M134 164L160 140L186 164V184H134V164Z"
        fill="#30483A"
        fillOpacity="0.12"
        stroke="#30483A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="160" cy="168" r="7" fill="#C77D61" />
      {/* Orbital nodes representing Lifestyle (40%), Living (40%), Personality (20%) */}
      <circle cx="68" cy="116" r="10" fill="#30483A" />
      <circle cx="68" cy="116" r="16" stroke="#30483A" strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="248" cy="134" r="9" fill="#C77D61" />
      <circle cx="248" cy="134" r="15" stroke="#C77D61" strokeOpacity="0.25" strokeWidth="2" />
      <circle cx="184" cy="276" r="7" fill="#879783" />
    </svg>
  );
}

/**
 * Honest Empty State Component.
 * Used across Discovery, Connections, Messages, and Admin screens when 0 records exist.
 */
export interface EmptyOrbitStateProps {
  title?: string;
  description?: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  onResetFilters?: () => void;
  showInviteHint?: boolean;
}

export function EmptyOrbitState({
  title = "There isn't anyone in your orbit just yet.",
  description = "SpaceSync only displays genuine, published flatmate profiles from real people. We never pad discovery with sample profiles or simulated matches.",
  primaryActionLabel,
  primaryActionHref,
  onResetFilters,
  showInviteHint = true,
}: EmptyOrbitStateProps) {
  return (
    <div
      className="bg-white border border-border rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-warm"
      data-testid="empty-orbit-state"
    >
      <div className="flex justify-center mb-6">
        <OrbitalIllustration className="w-40 h-40" />
      </div>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sand text-forest mb-3">
        <Compass className="w-3.5 h-3.5 text-terracotta" />
        Honest Live Database State
      </span>
      <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-3">{title}</h2>
      <p className="text-muted text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sand hover:bg-sand-dark text-charcoal text-sm font-medium transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Adjust or Clear Filters
          </button>
        )}
        {primaryActionLabel && primaryActionHref && (
          <Link
            href={primaryActionHref}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest hover:bg-forest-light text-ivory text-sm font-medium transition"
          >
            <Sparkles className="w-4 h-4" />
            {primaryActionLabel}
          </Link>
        )}
      </div>

      {showInviteHint && (
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-left bg-ivory/70 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center shrink-0 mt-0.5">
              <Share2 className="w-4 h-4 text-forest" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                Growing your city&apos;s orbit
              </p>
              <p className="text-xs text-muted mt-0.5">
                Share SpaceSync in your student cohort, MBA community, or workplace relocation group so others in your city can compare Peace Scores with you.
              </p>
            </div>
          </div>
          <Link
            href="/#waitlist"
            className="shrink-0 text-xs font-semibold text-terracotta hover:text-terracotta-dark underline underline-offset-4"
          >
            Join city launch list
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Architectural Illustration of the Peace Score Engine.
 * Explicitly labelled as a diagram of the deterministic scoring formula, never a real user.
 */
export function PeaceScoreArchitectureDiagram() {
  return (
    <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            System Illustration — Deterministic Formula (Not a Live User Profile)
          </span>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-sand text-charcoal">
          0–100 Normalised Scale
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Orbital gauge diagram */}
        <div className="md:col-span-5 flex flex-col items-center text-center p-5 rounded-2xl bg-ivory border border-border">
          <div className="relative w-36 h-36 flex items-center justify-center mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" stroke="#EEE5D8" strokeWidth="10" fill="none" />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#30483A"
                strokeWidth="10"
                strokeDasharray="314"
                strokeDashoffset="50"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] uppercase tracking-wider text-muted font-medium">
                Formula Output
              </span>
              <span className="font-serif text-3xl text-forest font-semibold">w₁·L + w₂·V + w₃·P</span>
              <span className="text-[11px] text-terracotta font-medium mt-0.5">Weighted Index</span>
            </div>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Calculated dynamically from two real users&apos; saved answers. Unanswered questions are excluded from the denominator rather than guessed.
          </p>
        </div>

        {/* Right: 3 Configurable Pillars */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-ivory/80 border border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif text-base font-medium text-charcoal">
                1. Lifestyle & Daily Habits
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-forest text-ivory">
                40% Default Weight
              </span>
            </div>
            <p className="text-xs text-muted">
              Sleep schedule, cleanliness standards, cooking frequency, kitchen dietary boundaries, smoking, overnight guests, noise tolerance, work routine, pets, and chores.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ivory/80 border border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif text-base font-medium text-charcoal">
                2. Living Preferences & Budget
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-terracotta text-ivory">
                40% Default Weight
              </span>
            </div>
            <p className="text-xs text-muted">
              Continuous monthly rent overlap (INR), shortlisted neighbourhoods, moving timeline alignment, room configuration, and flatshare search intent.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ivory/80 border border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-serif text-base font-medium text-charcoal">
                3. Personality & Communication
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage text-ivory">
                20% Default Weight
              </span>
            </div>
            <p className="text-xs text-muted">
              Social interaction cadence, recharge style, house communication preferences, conflict resolution approach, and shared vs independent time.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>
          <strong>Deal-breaker handling:</strong> Flagged separately when a non-negotiable threshold is crossed.
        </span>
        <span>
          <strong>Note:</strong> An estimate for reflection — never a guarantee of compatibility.
        </span>
      </div>
    </div>
  );
}
