"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PRIMARY_CITIES,
  MOVING_TIMELINE_OPTIONS,
} from "@/lib/constants/options";
import { formatValueLabel } from "@/lib/peace-score";
import { formatInr, getInitials } from "@/lib/utils";
import { EmptyOrbitState } from "@/components/ui/OrbitalGraphics";
import { PeaceScoreBadge } from "@/components/ui/PeaceScoreBadge";
import { ConfigStatusBanner } from "@/components/ui/ConfigStatusBanner";
import { ProfileActionsBar } from "@/components/discovery/ProfileActionsBar";
import type { DiscoveryDashboardData } from "@/lib/discovery/loader";
import type { DiscoveryFilterParams } from "@/lib/discovery/filter";
import {
  MapPin,
  Briefcase,
  SlidersHorizontal,
  Sparkles,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpRight,
} from "lucide-react";

export function DiscoveryClient({
  data,
  initialFilters,
}: {
  data: DiscoveryDashboardData;
  initialFilters: DiscoveryFilterParams;
}) {
  const router = useRouter();

  const [city, setCity] = useState(initialFilters.city || "all");
  const [area, setArea] = useState(initialFilters.area || "");
  const [maxBudget, setMaxBudget] = useState(
    initialFilters.maxBudgetInr ? String(initialFilters.maxBudgetInr) : ""
  );
  const [movingTimeline, setMovingTimeline] = useState(
    initialFilters.movingTimeline || "all"
  );
  const [sleepSchedule, setSleepSchedule] = useState(
    initialFilters.sleepSchedule || "all"
  );
  const [cleanlinessLevel, setCleanlinessLevel] = useState(
    initialFilters.cleanlinessLevel || "all"
  );
  const [smokingPreference, setSmokingPreference] = useState(
    initialFilters.smokingPreference || "all"
  );
  const [dietaryPreference, setDietaryPreference] = useState(
    initialFilters.dietaryPreference || "all"
  );
  const [petPreference, setPetPreference] = useState(
    initialFilters.petPreference || "all"
  );
  const [workStudyRoutine, setWorkStudyRoutine] = useState(
    initialFilters.workStudyRoutine || "all"
  );
  const [guestsOvernight, setGuestsOvernight] = useState(
    initialFilters.guestsOvernight || "all"
  );
  const [sortBy, setSortBy] = useState<"peace_score" | "recent">(
    initialFilters.sortBy || "peace_score"
  );
  const [showAllFilters, setShowAllFilters] = useState(false);

  const activeFilterCount = [
    city !== "all",
    Boolean(area),
    Boolean(maxBudget),
    movingTimeline !== "all",
    sleepSchedule !== "all",
    cleanlinessLevel !== "all",
    smokingPreference !== "all",
    dietaryPreference !== "all",
    petPreference !== "all",
    workStudyRoutine !== "all",
    guestsOvernight !== "all",
  ].filter(Boolean).length;

  function applyFilters(targetPage = 1) {
    const params = new URLSearchParams();
    if (city && city !== "all") params.set("city", city);
    if (area.trim()) params.set("area", area.trim());
    if (maxBudget.trim()) params.set("maxBudget", maxBudget.trim());
    if (movingTimeline !== "all") params.set("timeline", movingTimeline);
    if (sleepSchedule !== "all") params.set("sleep", sleepSchedule);
    if (cleanlinessLevel !== "all") params.set("cleanliness", cleanlinessLevel);
    if (smokingPreference !== "all") params.set("smoking", smokingPreference);
    if (data.isPremiumViewer) {
      if (dietaryPreference !== "all") params.set("diet", dietaryPreference);
      if (petPreference !== "all") params.set("pets", petPreference);
      if (workStudyRoutine !== "all") params.set("routine", workStudyRoutine);
      if (guestsOvernight !== "all") params.set("guests", guestsOvernight);
    }
    if (sortBy !== "peace_score") params.set("sort", sortBy);
    if (targetPage > 1) params.set("page", String(targetPage));

    const qs = params.toString();
    router.push(qs ? `/discover?${qs}` : "/discover");
  }

  function resetFilters() {
    setCity("all");
    setArea("");
    setMaxBudget("");
    setMovingTimeline("all");
    setSleepSchedule("all");
    setCleanlinessLevel("all");
    setSmokingPreference("all");
    setDietaryPreference("all");
    setPetPreference("all");
    setWorkStudyRoutine("all");
    setGuestsOvernight("all");
    setSortBy("peace_score");
    router.push("/discover");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest">
            Database-Backed Flatmate Discovery
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal mt-1">
            Discover Compatible Flatmates
          </h1>
          <p className="text-sm text-muted mt-1">
            Showing genuine, published flatmate profiles ranked by your deterministic Peace Score. No property listings and zero dummy profiles.
          </p>
        </div>

        {data.isAuthenticated && !data.viewerProfilePublished && (
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-terracotta text-ivory text-xs font-semibold shadow-sm hover:bg-terracotta-dark transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Complete & Publish Your Profile
          </Link>
        )}
      </div>

      {/* Configuration or Unauthenticated Notice */}
      {!data.isSupabaseConfigured && (
        <ConfigStatusBanner
          serviceName="Supabase PostgreSQL Discovery"
          missingVars={data.missingSupabaseVars}
        />
      )}

      {data.isSupabaseConfigured && !data.isAuthenticated && (
        <div className="p-4 rounded-2xl bg-sand/80 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-charcoal">
          <span>
            <strong>Sign in required for personalized Peace Scores:</strong> For privacy and security, only authenticated members can view published flatmate profiles and calculate pairwise compatibility.
          </span>
          <Link
            href="/login?redirectTo=/discover"
            className="px-4 py-2 rounded-full bg-forest text-ivory font-semibold shrink-0"
          >
            Sign in to view profiles
          </Link>
        </div>
      )}

      {/* Filter Bar (Modern Pill & Drawer Design) */}
      <div
        className="bg-white border border-border rounded-3xl p-5 sm:p-6 shadow-warm space-y-4"
        data-testid="discovery-filters"
      >
        {/* City Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-charcoal shrink-0 mr-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              City:
            </span>
            <button
              type="button"
              onClick={() => {
                setCity("all");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                city === "all"
                  ? "bg-forest text-ivory font-semibold shadow-xs"
                  : "bg-ivory border border-border text-charcoal hover:bg-sand"
              }`}
            >
              All Cities
            </button>
            {PRIMARY_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCity(c);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                  city === c
                    ? "bg-forest text-ivory font-semibold shadow-xs"
                    : "bg-ivory border border-border text-charcoal hover:bg-sand"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-medium text-muted hover:text-charcoal underline self-end sm:self-auto shrink-0"
          >
            Reset all
          </button>
        </div>

        {/* Primary Search Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Preferred Neighbourhood */}
          <div className="lg:col-span-4 relative">
            <MapPin className="w-3.5 h-3.5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="filter-area"
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Neighbourhood (e.g. Indiranagar, Bandra)"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-border bg-ivory text-xs text-charcoal focus:outline-hidden focus:border-forest"
            />
          </div>

          {/* Max Budget */}
          <div className="lg:col-span-3">
            <input
              id="filter-budget"
              type="number"
              step={1000}
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="Max Budget (₹/mo)"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-ivory text-xs text-charcoal focus:outline-hidden focus:border-forest"
            />
          </div>

          {/* Sort Order */}
          <div className="lg:col-span-2">
            <select
              id="filter-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "peace_score" | "recent")}
              className="w-full px-3 py-2.5 rounded-2xl border border-border bg-ivory text-xs text-charcoal focus:outline-hidden focus:border-forest"
            >
              <option value="peace_score">Highest Peace Score</option>
              <option value="recent">Recently Active</option>
            </select>
          </div>

          {/* More Filters Toggle & Search Button */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllFilters((prev) => !prev)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl border text-xs font-semibold transition ${
                showAllFilters || activeFilterCount > 1
                  ? "border-forest bg-sand text-forest shadow-xs"
                  : "border-border bg-ivory text-charcoal hover:bg-sand/60"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Habits & Rules</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-forest text-ivory text-[10px] flex items-center justify-center ml-0.5">
                  {activeFilterCount}
                </span>
              )}
              {showAllFilters ? (
                <ChevronUp className="w-3.5 h-3.5 ml-auto" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-auto" />
              )}
            </button>

            <button
              type="button"
              onClick={() => applyFilters(1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-light text-ivory text-xs font-semibold shadow-xs transition shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Collapsible Living Boundaries & Premium Filters Drawer */}
        {showAllFilters && (
          <div className="pt-4 border-t border-border space-y-5 animate-fade-in">
            {/* Core Boundaries */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-3">
                Core Living Boundaries
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <label htmlFor="filter-timeline" className="block text-[11px] font-medium text-charcoal mb-1">
                    Moving Timeline
                  </label>
                  <select
                    id="filter-timeline"
                    value={movingTimeline}
                    onChange={(e) => setMovingTimeline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-ivory text-xs text-charcoal"
                  >
                    <option value="all">Any Timeline</option>
                    {MOVING_TIMELINE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-sleep" className="block text-[11px] font-medium text-charcoal mb-1">
                    Sleep Schedule
                  </label>
                  <select
                    id="filter-sleep"
                    value={sleepSchedule}
                    onChange={(e) => setSleepSchedule(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-ivory text-xs text-charcoal"
                  >
                    <option value="all">Any Sleep Schedule</option>
                    <option value="early_bird">Early bird</option>
                    <option value="balanced">Balanced</option>
                    <option value="night_owl">Night owl</option>
                    <option value="flexible_shift">Flexible</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-cleanliness" className="block text-[11px] font-medium text-charcoal mb-1">
                    Cleanliness Preference
                  </label>
                  <select
                    id="filter-cleanliness"
                    value={cleanlinessLevel}
                    onChange={(e) => setCleanlinessLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-ivory text-xs text-charcoal"
                  >
                    <option value="all">Any Cleanliness Level</option>
                    <option value="spotless">Spotless daily</option>
                    <option value="tidy_shared_spaces">Tidy shared spaces</option>
                    <option value="weekly_deep_clean">Weekly deep clean</option>
                    <option value="relaxed">Relaxed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-smoking" className="block text-[11px] font-medium text-charcoal mb-1">
                    Smoking Preference
                  </label>
                  <select
                    id="filter-smoking"
                    value={smokingPreference}
                    onChange={(e) => setSmokingPreference(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-ivory text-xs text-charcoal"
                  >
                    <option value="all">Any Smoking Preference</option>
                    <option value="never">Strictly smoke-free</option>
                    <option value="outside_only">Outdoors / balcony only</option>
                    <option value="tolerant">Comfortable around smokers</option>
                    <option value="occasionally_indoors">Occasional indoor smoker</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Premium Boundaries */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest">
                  <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                  Premium Granular Boundaries (Diet, Pets, WFH, Guests)
                </span>
                {!data.isPremiumViewer && (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-dark hover:underline"
                  >
                    <Lock className="w-3 h-3" />
                    Unlock with Premium (₹199/mo)
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[11px] text-muted mb-1">Kitchen Dietary Rule</label>
                  <select
                    disabled={!data.isPremiumViewer}
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-ivory disabled:opacity-50 text-xs text-charcoal"
                  >
                    <option value="all">Any Dietary Kitchen</option>
                    <option value="strict_veg_kitchen">Strictly vegetarian kitchen</option>
                    <option value="veg_preferred_flexible">Vegetarian (flexible kitchen)</option>
                    <option value="non_veg_comfortable">Open / non-veg comfortable</option>
                    <option value="vegan">Plant-based / vegan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-muted mb-1">Pet Preference</label>
                  <select
                    disabled={!data.isPremiumViewer}
                    value={petPreference}
                    onChange={(e) => setPetPreference(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-ivory disabled:opacity-50 text-xs text-charcoal"
                  >
                    <option value="all">Any Pet Preference</option>
                    <option value="no_pets">Pet-free home</option>
                    <option value="love_pets_dont_own">Loves pets</option>
                    <option value="have_pets">Has a pet</option>
                    <option value="allergic">Pet allergy (strictly no pets)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-muted mb-1">Work / Study Routine</label>
                  <select
                    disabled={!data.isPremiumViewer}
                    value={workStudyRoutine}
                    onChange={(e) => setWorkStudyRoutine(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-ivory disabled:opacity-50 text-xs text-charcoal"
                  >
                    <option value="all">Any Work Routine</option>
                    <option value="mostly_office_campus">At office / campus</option>
                    <option value="hybrid">Hybrid (2–3 days WFH)</option>
                    <option value="mostly_from_home">Mostly WFH</option>
                    <option value="late_study_hours">Late study hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-muted mb-1">Overnight Guests</label>
                  <select
                    disabled={!data.isPremiumViewer}
                    value={guestsOvernight}
                    onChange={(e) => setGuestsOvernight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-ivory disabled:opacity-50 text-xs text-charcoal"
                  >
                    <option value="all">Any Guest Policy</option>
                    <option value="rarely">Rarely hosts</option>
                    <option value="occasional_with_notice">Occasional with notice</option>
                    <option value="weekends_welcome">Weekends welcome</option>
                    <option value="anytime_open">Open-door social</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-muted hover:text-charcoal underline"
              >
                Clear all filters
              </button>
              <button
                type="button"
                onClick={() => applyFilters(1)}
                className="px-6 py-2 rounded-full bg-forest hover:bg-forest-light text-ivory text-xs font-semibold shadow-xs transition"
              >
                Apply All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Area */}
      {data.results.items.length === 0 ? (
        <EmptyOrbitState
          title="There isn't anyone in your orbit just yet."
          description="No published flatmate profiles match your current filters right now. Because SpaceSync strictly forbids dummy profiles or fabricated users, we show this honest empty state whenever 0 eligible records exist in the database."
          onResetFilters={resetFilters}
          primaryActionLabel={
            data.isAuthenticated ? "Review Your Profile" : "Create Your Compatibility Profile"
          }
          primaryActionHref={data.isAuthenticated ? "/profile" : "/signup"}
        />
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              Showing <strong>{data.results.items.length}</strong> of{" "}
              <strong>{data.results.totalCount}</strong> compatible profile(s)
            </span>
            <span>
              Page {data.results.page} of {data.results.totalPages}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.results.items.map((item) => {
              const prof = item.candidate.profile;
              const liv = item.candidate.living;
              const priv = item.candidate.privacy;
              const showOrg = priv?.show_institution_or_company !== false;
              const showAreas = priv?.show_exact_neighborhoods !== false;

              return (
                <div
                  key={prof.id}
                  className="group bg-white/95 backdrop-blur-sm border border-border/80 hover:border-forest/40 rounded-3xl p-6 sm:p-7 shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col justify-between space-y-5 transform hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-sand/80 ring-2 ring-forest/20 flex items-center justify-center font-serif text-base font-bold text-forest shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                          {getInitials(prof.first_name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h2 className="font-serif text-xl text-charcoal group-hover:text-forest transition-colors">
                              {prof.first_name}
                            </h2>
                            {item.isCandidatePremium && (
                              <span className="px-2 py-0.5 rounded-full bg-terracotta/15 text-[10px] font-semibold text-terracotta-dark border border-terracotta/20">
                                Priority Sync
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-terracotta" />
                            {prof.city}
                          </p>
                        </div>
                      </div>

                      <PeaceScoreBadge result={item.peaceScore} size="sm" />
                    </div>

                    {(prof.occupation_title || prof.occupation_category) && (
                      <p className="text-xs text-charcoal flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-forest shrink-0" />
                        <span className="truncate">
                          {prof.occupation_title || formatValueLabel(prof.occupation_category)}
                          {showOrg && prof.institution_or_company
                            ? ` · ${prof.institution_or_company}`
                            : ""}
                        </span>
                      </p>
                    )}

                    {prof.bio && (
                      <p className="text-xs text-muted line-clamp-3 leading-relaxed">
                        {prof.bio}
                      </p>
                    )}

                    {/* Category Breakdown Mini Meters */}
                    {item.peaceScore.overallScore !== null && (
                      <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2.5 bg-ivory rounded-xl border border-border/70 text-center text-[10px]">
                        <div>
                          <span className="text-muted block">Lifestyle</span>
                          <span className="font-semibold text-forest">
                            {item.peaceScore.categories.lifestyle?.score ?? "—"}%
                          </span>
                        </div>
                        <div className="border-x border-border/70">
                          <span className="text-muted block">Living</span>
                          <span className="font-semibold text-forest">
                            {item.peaceScore.categories.living?.score ?? "—"}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block">Comm</span>
                          <span className="font-semibold text-forest">
                            {item.peaceScore.categories.personality?.score ?? "—"}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Deal-Breaker Status Pill */}
                    {item.peaceScore.hasDealbreakerConflict ? (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] font-medium text-amber-900 flex items-center gap-1.5">
                        <span className="text-amber-700">⚠️</span>
                        <span>Deal-breaker conflict (Score capped at 49%)</span>
                      </div>
                    ) : item.peaceScore.overallScore !== null ? (
                      <div className="p-1.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-[10px] font-medium text-emerald-800 flex items-center gap-1">
                        <span>✓</span>
                        <span>Zero deal-breaker conflicts</span>
                      </div>
                    ) : null}

                    <div className="p-3.5 rounded-2xl bg-ivory border border-border/70 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted">Monthly Budget:</span>
                        <span className="font-semibold text-charcoal">
                          {formatInr(liv?.budget_min_inr)} – {formatInr(liv?.budget_max_inr)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Move-in:</span>
                        <span className="font-medium text-charcoal">
                          {formatValueLabel(liv?.moving_timeline)}
                        </span>
                      </div>
                      {showAreas && liv?.preferred_areas && liv.preferred_areas.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {liv.preferred_areas.slice(0, 3).map((a) => (
                            <span
                              key={a}
                              className="px-2 py-0.5 rounded-full bg-white border border-border/80 text-[11px] text-charcoal"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top similarity preview */}
                    {item.peaceScore.similarities[0] && (
                      <p className="text-[11px] text-forest bg-forest/5 px-3 py-2 rounded-xl border border-forest/20">
                        <strong>Top overlap:</strong> {item.peaceScore.similarities[0].explanation}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border space-y-3">
                    <Link
                      href={`/discover/${prof.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:underline"
                    >
                      <span>View full Peace Score breakdown</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <ProfileActionsBar
                      targetUserId={prof.id}
                      targetName={prof.first_name}
                      peaceScore={item.peaceScore.overallScore}
                      initialInterestStatus={item.existingInterestStatus}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {data.results.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                disabled={data.results.page <= 1}
                onClick={() => applyFilters(data.results.page - 1)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-border bg-white disabled:opacity-40 text-xs font-medium text-charcoal"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-xs text-muted">
                Page {data.results.page} of {data.results.totalPages}
              </span>
              <button
                type="button"
                disabled={data.results.page >= data.results.totalPages}
                onClick={() => applyFilters(data.results.page + 1)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-border bg-white disabled:opacity-40 text-xs font-medium text-charcoal"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
