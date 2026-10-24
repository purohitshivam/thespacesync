import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  Utensils,
  Moon,
  Laptop,
} from "lucide-react";

export function HeroMatchCard() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Ambient background blur/glow */}
      <div className="absolute -inset-2 bg-gradient-to-tr from-forest/10 via-sand/40 to-terracotta/15 rounded-3xl blur-2xl -z-10 transform scale-95" />

      {/* Main Glassmorphic Match Card */}
      <div className="bg-white/95 backdrop-blur-xl border border-sand-dark/60 rounded-3xl p-6 sm:p-7 shadow-warm-lg space-y-5 transition duration-300 hover:shadow-2xl">
        {/* Card Header: Context & Location */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-forest" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">
              Live Compatibility Sync
            </span>
          </div>
          <span className="text-[11px] font-medium text-forest bg-sand/70 px-2.5 py-1 rounded-full border border-border/70">
            Bengaluru · Indiranagar
          </span>
        </div>

        {/* The Two Profiles + Circular Peace Score Gauge */}
        <div className="grid grid-cols-12 items-center gap-3 py-1">
          {/* Flatmate A */}
          <div className="col-span-4 flex flex-col items-center text-center space-y-1.5">
            <div className="w-14 h-14 rounded-full bg-sand flex items-center justify-center font-serif text-lg font-bold text-forest ring-4 ring-ivory shadow-sm">
              AS
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal leading-tight">Aarav S.</p>
              <p className="text-[11px] text-muted">24 · UX Designer</p>
            </div>
          </div>

          {/* Central 94% Peace Score Badge */}
          <div className="col-span-4 flex flex-col items-center text-center px-1">
            <div className="relative flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-forest to-forest-dark text-ivory shadow-md ring-4 ring-forest/10">
              <span className="text-xs uppercase tracking-wider text-ivory/70 font-medium scale-90">
                Peace Score
              </span>
              <span className="font-serif text-2xl font-bold leading-none tracking-tight">
                94%
              </span>
              <span className="text-[9px] font-medium text-sage-light">Optimal</span>
            </div>
          </div>

          {/* Flatmate B */}
          <div className="col-span-4 flex flex-col items-center text-center space-y-1.5">
            <div className="w-14 h-14 rounded-full bg-terracotta/20 flex items-center justify-center font-serif text-lg font-bold text-terracotta-dark ring-4 ring-ivory shadow-sm">
              KM
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal leading-tight">Kabir M.</p>
              <p className="text-[11px] text-muted">26 · AI Engineer</p>
            </div>
          </div>
        </div>

        {/* Category breakdown meters */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-ivory rounded-2xl border border-border/70 text-center text-xs">
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wider">Lifestyle</div>
            <div className="font-semibold text-forest">96%</div>
          </div>
          <div className="border-x border-border/80">
            <div className="text-[10px] text-muted uppercase tracking-wider">Living</div>
            <div className="font-semibold text-forest">92%</div>
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wider">Communication</div>
            <div className="font-semibold text-forest">95%</div>
          </div>
        </div>

        {/* Real Living Habit Sync Chips */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            Verified Boundary Alignment
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-ivory border border-border/70">
              <Utensils className="w-3.5 h-3.5 text-forest shrink-0" />
              <span className="truncate text-charcoal">Veg Kitchen · Clean Stove</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-ivory border border-border/70">
              <Moon className="w-3.5 h-3.5 text-forest shrink-0" />
              <span className="truncate text-charcoal">Quiet Hours · 11 PM</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-ivory border border-border/70">
              <Laptop className="w-3.5 h-3.5 text-forest shrink-0" />
              <span className="truncate text-charcoal">Hybrid WFH · Zone Set</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-ivory border border-border/70">
              <ShieldCheck className="w-3.5 h-3.5 text-terracotta shrink-0" />
              <span className="truncate text-charcoal font-medium">Deal-Breakers: None</span>
            </div>
          </div>
        </div>

        {/* CTA Interaction Inside Card */}
        <div className="pt-2">
          <Link
            href="/signup"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-forest hover:bg-forest-light text-ivory text-xs sm:text-sm font-medium shadow-warm transition group"
          >
            <span>Sync Your Profile With Kabir</span>
            <ArrowRight className="w-3.5 h-3.5 transition transform group-hover:translate-x-0.5" />
          </Link>
          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-muted">
            <Lock className="w-3 h-3 text-sage" />
            <span>Mutual acceptance required before private chat opens</span>
          </div>
        </div>
      </div>

      {/* Floating Micro-Badge 1: Top Right */}
      <div className="hidden sm:flex absolute -top-4 -right-4 bg-white/95 backdrop-blur-md border border-sand-dark/60 rounded-2xl py-2 px-3.5 shadow-warm items-center gap-2 text-xs text-charcoal">
        <Sparkles className="w-3.5 h-3.5 text-terracotta shrink-0" />
        <span className="font-medium">100% Rules-Based</span>
      </div>

      {/* Floating Micro-Badge 2: Bottom Left */}
      <div className="hidden sm:flex absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md border border-sand-dark/60 rounded-2xl py-2 px-3.5 shadow-warm items-center gap-2 text-xs text-charcoal">
        <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
        <span className="font-medium">Zero Broker Spam</span>
      </div>
    </div>
  );
}
