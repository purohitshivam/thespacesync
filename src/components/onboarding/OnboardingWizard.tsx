"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  PRIMARY_CITIES,
  CITY_NEIGHBOURHOODS,
  OCCUPATION_CATEGORY_OPTIONS,
  SEARCH_INTENT_OPTIONS,
  LIFESTYLE_QUESTIONS,
  PERSONALITY_QUESTIONS,
  MOVING_TIMELINE_OPTIONS,
  LIVING_ARRANGEMENT_OPTIONS,
  HOUSEHOLD_BOUNDARIES_OPTIONS,
  NON_NEGOTIABLES_OPTIONS,
  ALL_IMPORTANCE_QUESTIONS,
} from "@/lib/constants/options";
import { formatValueLabel } from "@/lib/peace-score";
import {
  basicInfoSchema,
  livingPreferencesSchema,
} from "@/lib/validations";
import type {
  FullUserProfile,
  ImportanceLevel,
  PreferenceImportanceRow,
} from "@/types/database";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Upload,
  ShieldCheck,
  Sparkles,
  Info,
  Eye,
  Lock,
} from "lucide-react";

const STORAGE_DRAFT_KEY = "spacesync_onboarding_draft_v1";

interface OnboardingWizardProps {
  userId: string;
  initialData: FullUserProfile;
}

export function OnboardingWizard({ userId, initialData }: OnboardingWizardProps) {
  const router = useRouter();

  const [step, setStep] = useState<number>(initialData.profile.onboarding_step || 1);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Step 1: Basic Info
  const [firstName, setFirstName] = useState(initialData.profile.first_name || "");
  const [ageConfirmed18Plus, setAgeConfirmed18Plus] = useState(
    Boolean(initialData.profile.age_confirmed_18_plus)
  );
  const [birthYear, setBirthYear] = useState<string>(
    initialData.profile.birth_year ? String(initialData.profile.birth_year) : ""
  );
  const [avatarUrl, setAvatarUrl] = useState(initialData.profile.avatar_url || "");
  const [bio, setBio] = useState(initialData.profile.bio || "");
  const [occupationCategory, setOccupationCategory] = useState<string>(
    initialData.profile.occupation_category || "working_professional"
  );
  const [occupationTitle, setOccupationTitle] = useState(
    initialData.profile.occupation_title || ""
  );
  const [institutionOrCompany, setInstitutionOrCompany] = useState(
    initialData.profile.institution_or_company || ""
  );
  const [city, setCity] = useState(initialData.profile.city || "Bangalore");
  const [searchIntent, setSearchIntent] = useState<string>(
    initialData.profile.search_intent || "looking_for_flatmate"
  );

  // Step 2: Lifestyle
  const [lifestyle, setLifestyle] = useState<Record<string, string | null>>({
    sleep_schedule: initialData.lifestyle?.sleep_schedule ?? null,
    cleanliness_level: initialData.lifestyle?.cleanliness_level ?? null,
    cooking_habits: initialData.lifestyle?.cooking_habits ?? null,
    dietary_preference: initialData.lifestyle?.dietary_preference ?? null,
    smoking_preference: initialData.lifestyle?.smoking_preference ?? null,
    guests_overnight: initialData.lifestyle?.guests_overnight ?? null,
    noise_tolerance: initialData.lifestyle?.noise_tolerance ?? null,
    socialising_at_home: initialData.lifestyle?.socialising_at_home ?? null,
    work_study_routine: initialData.lifestyle?.work_study_routine ?? null,
    pet_preference: initialData.lifestyle?.pet_preference ?? null,
    chore_arrangement: initialData.lifestyle?.chore_arrangement ?? null,
  });

  // Step 3: Personality & Communication
  const [personality, setPersonality] = useState<Record<string, string | null>>({
    social_interaction_level: initialData.personality?.social_interaction_level ?? null,
    energy_orientation: initialData.personality?.energy_orientation ?? null,
    communication_style: initialData.personality?.communication_style ?? null,
    conflict_resolution: initialData.personality?.conflict_resolution ?? null,
    home_atmosphere: initialData.personality?.home_atmosphere ?? null,
    shared_vs_independent_time: initialData.personality?.shared_vs_independent_time ?? null,
  });

  // Step 4: Living Preferences
  const [budgetMin, setBudgetMin] = useState<string>(
    initialData.living?.budget_min_inr ? String(initialData.living.budget_min_inr) : "15000"
  );
  const [budgetMax, setBudgetMax] = useState<string>(
    initialData.living?.budget_max_inr ? String(initialData.living.budget_max_inr) : "30000"
  );
  const [preferredAreas, setPreferredAreas] = useState<string[]>(
    initialData.living?.preferred_areas ?? []
  );
  const [customAreaInput, setCustomAreaInput] = useState("");
  const [movingTimeline, setMovingTimeline] = useState<string>(
    initialData.living?.moving_timeline ?? "within_1_month"
  );
  const [livingArrangement, setLivingArrangement] = useState<string>(
    initialData.living?.living_arrangement ?? "private_room_2bhk"
  );
  const [householdBoundaries, setHouseholdBoundaries] = useState<string[]>(
    initialData.living?.household_boundaries ?? []
  );
  const [nonNegotiables, setNonNegotiables] = useState<string[]>(
    initialData.living?.non_negotiables ?? []
  );

  // Step 5: Preference Importance & Deal-breakers
  const [importanceMap, setImportanceMap] = useState<
    Record<string, { importance: ImportanceLevel; is_dealbreaker: boolean }>
  >(() => {
    const initial: Record<string, { importance: ImportanceLevel; is_dealbreaker: boolean }> = {};
    for (const q of ALL_IMPORTANCE_QUESTIONS) {
      initial[q.key] = { importance: "medium", is_dealbreaker: false };
    }
    for (const row of initialData.importance || []) {
      initial[row.question_key] = {
        importance: row.importance || "medium",
        is_dealbreaker: Boolean(row.is_dealbreaker),
      };
    }
    return initial;
  });

  const [isPublished, setIsPublished] = useState(Boolean(initialData.profile.is_published));

  // Restore any unsaved session draft for this user on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_DRAFT_KEY}:${userId}`);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft && typeof draft === "object") {
        if (draft.firstName && !initialData.profile.first_name) setFirstName(draft.firstName);
        if (draft.city && !initialData.profile.city) setCity(draft.city);
      }
    } catch {
      // Ignore storage read errors
    }
  }, [userId, initialData.profile.first_name, initialData.profile.city]);

  // Save lightweight local session backup whenever step changes
  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_DRAFT_KEY}:${userId}`,
        JSON.stringify({ firstName, city, step })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [userId, firstName, city, step]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be smaller than 5 MB.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase Storage is not configured in this environment.");
      return;
    }

    setUploadingPhoto(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        setAvatarUrl(publicUrlData.publicUrl);
      }
    } catch {
      setError("Failed to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  function buildImportanceArray(): PreferenceImportanceRow[] {
    return Object.entries(importanceMap).map(([question_key, val]) => ({
      user_id: userId,
      question_key,
      importance: val.importance,
      is_dealbreaker: val.is_dealbreaker,
    }));
  }

  async function persistProgress(nextStep: number, options?: { completed?: boolean; publish?: boolean }) {
    setError(null);
    setSaveBanner(null);

    // Validate Step 1
    if (step === 1 || options?.publish) {
      const parsedBasic = basicInfoSchema.safeParse({
        first_name: firstName,
        age_confirmed_18_plus: ageConfirmed18Plus,
        birth_year: birthYear ? Number(birthYear) : null,
        avatar_url: avatarUrl || null,
        bio,
        occupation_title: occupationTitle,
        occupation_category: occupationCategory || null,
        institution_or_company: institutionOrCompany,
        city,
        search_intent: searchIntent,
      });

      if (!parsedBasic.success) {
        setError(parsedBasic.error.issues[0]?.message || "Please complete the required fields in Step 1.");
        return false;
      }
    }

    // Validate Step 4
    if (step === 4 || options?.publish) {
      const parsedLiving = livingPreferencesSchema.safeParse({
        budget_min_inr: budgetMin ? Number(budgetMin) : null,
        budget_max_inr: budgetMax ? Number(budgetMax) : null,
        preferred_areas: preferredAreas,
        moving_timeline: movingTimeline || null,
        living_arrangement: livingArrangement || null,
        household_boundaries: householdBoundaries,
        non_negotiables: nonNegotiables,
      });

      if (!parsedLiving.success) {
        setError(parsedLiving.error.issues[0]?.message || "Please check your budget range in Step 4.");
        return false;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basicInfo: {
            first_name: firstName,
            age_confirmed_18_plus: ageConfirmed18Plus,
            birth_year: birthYear ? Number(birthYear) : null,
            avatar_url: avatarUrl || null,
            bio,
            occupation_title: occupationTitle,
            occupation_category: occupationCategory || null,
            institution_or_company: institutionOrCompany,
            city,
            search_intent: searchIntent,
          },
          lifestyle,
          personality,
          living: {
            budget_min_inr: budgetMin ? Number(budgetMin) : null,
            budget_max_inr: budgetMax ? Number(budgetMax) : null,
            preferred_areas: preferredAreas,
            moving_timeline: movingTimeline || null,
            living_arrangement: livingArrangement || null,
            household_boundaries: householdBoundaries,
            non_negotiables: nonNegotiables,
          },
          importance: buildImportanceArray(),
          onboardingStep: nextStep,
          onboardingCompleted: options?.completed ?? (nextStep === 6 ? true : undefined),
          isPublished: options?.publish !== undefined ? options.publish : isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save your onboarding progress.");
        return false;
      }

      if (options?.publish !== undefined) {
        setIsPublished(options.publish);
      }

      setStep(nextStep);
      setSaveBanner("Progress saved to your account.");
      return true;
    } catch {
      setError("Network error while saving your preferences. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function toggleArrayItem(list: string[], item: string, setter: (v: string[]) => void) {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  }

  const stepsMeta = [
    { num: 1, title: "Basic Context" },
    { num: 2, title: "Lifestyle Habits" },
    { num: 3, title: "Communication" },
    { num: 4, title: "Living & Budget" },
    { num: 5, title: "Importance & Deal-Breakers" },
    { num: 6, title: "Review & Publish" },
  ];

  const suggestedAreas = CITY_NEIGHBOURHOODS[city] || [];

  return (
    <div className="space-y-8" data-testid="onboarding-wizard">
      {/* Progress Header */}
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-7 shadow-warm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                Step {step} of 6
              </span>
              <span className="text-muted text-xs">·</span>
              <span className="text-xs font-medium text-charcoal">
                {stepsMeta[step - 1]?.title}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-charcoal mt-1">
              Build Your Compatibility Profile
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ivory border border-border text-xs font-medium text-charcoal self-start sm:self-auto">
            {isPublished ? (
              <>
                <Eye className="w-3.5 h-3.5 text-forest" />
                <span>Status: Published in Discovery</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-terracotta" />
                <span>Status: Private Draft (Unpublished)</span>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] text-muted font-medium">
            <span>Overall Profile Progress</span>
            <span className="font-semibold text-charcoal">{Math.round((step / 6) * 100)}% Completed</span>
          </div>
          <div className="h-2 w-full bg-sand rounded-full overflow-hidden">
            <div
              className="h-full bg-forest transition-all duration-500 ease-out rounded-full"
              style={{ width: `${Math.round((step / 6) * 100)}%` }}
            />
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
          {stepsMeta.map((s) => {
            const isCurrent = s.num === step;
            const isPast = s.num < step;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < step) setStep(s.num);
                }}
                className={`px-3 py-2.5 rounded-2xl text-left text-xs font-medium border transition-all duration-200 ${
                  isCurrent
                    ? "bg-forest text-ivory border-forest shadow-sm"
                    : isPast
                      ? "bg-sand/60 text-charcoal border-border hover:bg-sand hover:border-forest/40"
                      : "bg-ivory text-muted/80 border-border/80 cursor-default"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[10px] font-semibold ${isCurrent ? "text-ivory/80" : "text-muted"}`}>
                    0{s.num}
                  </span>
                  {isPast && <Check className="w-3 h-3 text-forest shrink-0" />}
                </div>
                <span className="truncate block font-semibold">{s.title}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-start gap-2.5 text-xs text-muted bg-ivory p-3.5 rounded-2xl border border-border">
          <Info className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <span>
            <strong>Deterministic Peace Score:</strong> Your answers are compared mathematically against verified flatmates in your city. Optional questions can be skipped without penalty.
          </span>
        </div>
      </div>

      {/* Feedback Banners */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-terracotta/10 border border-terracotta/40 text-xs text-terracotta-dark flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {saveBanner && !error && (
        <div className="p-3.5 rounded-2xl bg-forest/10 border border-forest/30 text-xs text-forest flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* STEP 1: BASIC INFORMATION */}
      {step === 1 && (
        <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-6">
          <div>
            <h2 className="font-serif text-2xl text-charcoal">1. Basic Context & Eligibility</h2>
            <p className="text-xs text-muted mt-1">
              Tell potential flatmates who you are, where you&apos;re moving, and whether you already have a flat or want to team up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                First name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Rohan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Birth year (Optional — minimised age representation, 18+)
              </label>
              <input
                type="number"
                min={1925}
                max={new Date().getFullYear() - 18}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="e.g. 2001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                City *
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPreferredAreas([]);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
              >
                {PRIMARY_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Occupation or Study Context
              </label>
              <select
                value={occupationCategory}
                onChange={(e) => setOccupationCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
              >
                {OCCUPATION_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Role / Course Title (Optional)
              </label>
              <input
                type="text"
                value={occupationTitle}
                onChange={(e) => setOccupationTitle(e.target.value)}
                placeholder="e.g. Product Designer or PGP Cohort"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                University or Company (Optional — can be hidden in privacy settings)
              </label>
              <input
                type="text"
                value={institutionOrCompany}
                onChange={(e) => setInstitutionOrCompany(e.target.value)}
                placeholder="e.g. Masters' Union, ISB, or Tech Startup"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
              />
            </div>
          </div>

          {/* Search Intent */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-charcoal">
              What is your flatshare search intent? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SEARCH_INTENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSearchIntent(opt.value)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    searchIntent === opt.value
                      ? "border-forest bg-sand/70 shadow-sm"
                      : "border-border bg-ivory hover:bg-sand/30"
                  }`}
                >
                  <p className="text-xs font-semibold text-charcoal">{opt.label}</p>
                  {opt.hint && <p className="text-[11px] text-muted mt-1">{opt.hint}</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Short Bio */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-charcoal">
                Short bio (Optional)
              </label>
              <span className="text-[11px] text-muted">{bio.length}/600</span>
            </div>
            <textarea
              rows={3}
              maxLength={600}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share a little about your daily routine, what you enjoy doing on weekends, and what kind of shared home you value..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
            />
          </div>

          {/* Optional Profile Photo */}
          <div className="p-4 rounded-2xl bg-ivory border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-charcoal">Optional Profile Photo</p>
              <p className="text-[11px] text-muted">
                Stored securely in Supabase Storage (JPEG, PNG, or WebP up to 5 MB).
              </p>
              {avatarUrl && (
                <p className="text-[11px] text-forest font-medium break-all">
                  Photo uploaded ✓
                </p>
              )}
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border text-xs font-medium text-charcoal cursor-pointer hover:bg-sand transition">
              <Upload className="w-3.5 h-3.5 text-forest" />
              <span>{uploadingPhoto ? "Uploading..." : "Upload Photo"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Age Confirmation */}
          <label className="flex items-start gap-2.5 text-xs text-charcoal cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={ageConfirmed18Plus}
              onChange={(e) => setAgeConfirmed18Plus(e.target.checked)}
              className="mt-0.5 rounded border-border text-forest"
            />
            <span>
              I confirm that I am at least <strong>18 years of age</strong>. (Required for eligibility) *
            </span>
          </label>
        </div>
      )}

      {/* STEP 2: LIFESTYLE PREFERENCES */}
      {step === 2 && (
        <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h2 className="font-serif text-2xl text-charcoal">
                2. Lifestyle & Daily Habits (40% Default Weight)
              </h2>
              <p className="text-xs text-muted mt-1">
                Answer the questions that matter to you. You can skip any optional question and return later.
              </p>
            </div>
            <button
              type="button"
              onClick={() => persistProgress(3)}
              className="text-xs font-semibold text-muted hover:text-charcoal underline underline-offset-4 self-start"
            >
              Skip optional questions →
            </button>
          </div>

          <div className="space-y-8">
            {LIFESTYLE_QUESTIONS.map((q, idx) => (
              <div key={q.key} className="space-y-3 pb-6 border-b border-border/70 last:border-b-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-terracotta">
                      Lifestyle {idx + 1} of {LIFESTYLE_QUESTIONS.length}
                    </span>
                    <h3 className="font-serif text-lg text-charcoal">{q.title}</h3>
                    <p className="text-xs text-muted">{q.subtitle}</p>
                  </div>
                  {lifestyle[q.key] && (
                    <button
                      type="button"
                      onClick={() => setLifestyle((prev) => ({ ...prev, [q.key]: null }))}
                      className="text-[11px] text-muted hover:text-charcoal underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {q.options.map((opt) => {
                    const selected = lifestyle[q.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setLifestyle((prev) => ({ ...prev, [q.key]: opt.value }))
                        }
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                          selected
                            ? "border-forest bg-forest/[0.04] shadow-sm ring-1 ring-forest/30"
                            : "border-border bg-ivory/80 hover:bg-sand/40 hover:border-forest/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-charcoal">{opt.label}</p>
                            {opt.hint && (
                              <p className="text-[11px] text-muted mt-1 leading-relaxed">{opt.hint}</p>
                            )}
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              selected
                                ? "border-forest bg-forest text-ivory shadow-xs"
                                : "border-border bg-white"
                            }`}
                          >
                            {selected ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-border" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: PERSONALITY & COMMUNICATION */}
      {step === 3 && (
        <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h2 className="font-serif text-2xl text-charcoal">
                3. Personality & Communication (20% Default Weight)
              </h2>
              <p className="text-xs text-muted mt-1">
                Self-descriptions of how you recharge, communicate, and resolve small household tensions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => persistProgress(4)}
              className="text-xs font-semibold text-muted hover:text-charcoal underline underline-offset-4 self-start"
            >
              Skip optional questions →
            </button>
          </div>

          <div className="space-y-8">
            {PERSONALITY_QUESTIONS.map((q, idx) => (
              <div key={q.key} className="space-y-3 pb-6 border-b border-border/70 last:border-b-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-forest">
                      Communication {idx + 1} of {PERSONALITY_QUESTIONS.length}
                    </span>
                    <h3 className="font-serif text-lg text-charcoal">{q.title}</h3>
                    <p className="text-xs text-muted">{q.subtitle}</p>
                  </div>
                  {personality[q.key] && (
                    <button
                      type="button"
                      onClick={() => setPersonality((prev) => ({ ...prev, [q.key]: null }))}
                      className="text-[11px] text-muted hover:text-charcoal underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {q.options.map((opt) => {
                    const selected = personality[q.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setPersonality((prev) => ({ ...prev, [q.key]: opt.value }))
                        }
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                          selected
                            ? "border-forest bg-forest/[0.04] shadow-sm ring-1 ring-forest/30"
                            : "border-border bg-ivory/80 hover:bg-sand/40 hover:border-forest/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-charcoal">{opt.label}</p>
                            {opt.hint && (
                              <p className="text-[11px] text-muted mt-1 leading-relaxed">{opt.hint}</p>
                            )}
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              selected
                                ? "border-forest bg-forest text-ivory shadow-xs"
                                : "border-border bg-white"
                            }`}
                          >
                            {selected ? (
                              <Check className="w-3 h-3 stroke-[3]" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-border" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: LIVING PREFERENCES & BUDGET */}
      {step === 4 && (
        <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-7">
          <div>
            <h2 className="font-serif text-2xl text-charcoal">
              4. Living Preferences & Budget (40% Default Weight)
            </h2>
            <p className="text-xs text-muted mt-1">
              Set your comfortable monthly rent range (per person in INR), preferred neighbourhoods in {city}, and household boundaries.
            </p>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Minimum Monthly Budget (₹ per person)
              </label>
              <input
                type="number"
                step={500}
                min={2000}
                max={250000}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Maximum Monthly Budget (₹ per person)
              </label>
              <input
                type="number"
                step={500}
                min={2000}
                max={300000}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
              />
            </div>
          </div>

          {/* Moving Timeline & Living Arrangement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Expected Moving Timeline
              </label>
              <select
                value={movingTimeline}
                onChange={(e) => setMovingTimeline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
              >
                {MOVING_TIMELINE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Preferred Living Arrangement
              </label>
              <select
                value={livingArrangement}
                onChange={(e) => setLivingArrangement(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-ivory text-sm text-charcoal"
              >
                {LIVING_ARRANGEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Neighbourhoods */}
          <div className="space-y-2.5">
            <label className="block text-xs font-medium text-charcoal">
              Preferred Neighbourhoods in {city} (Select up to 12)
            </label>
            {suggestedAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestedAreas.map((area) => {
                  const active = preferredAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArrayItem(preferredAreas, area, setPreferredAreas)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        active
                          ? "bg-forest text-ivory border-forest"
                          : "bg-ivory text-charcoal border-border hover:bg-sand"
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex gap-2 pt-1 max-w-md">
              <input
                type="text"
                value={customAreaInput}
                onChange={(e) => setCustomAreaInput(e.target.value)}
                placeholder="Add another locality..."
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-ivory text-xs text-charcoal"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = customAreaInput.trim();
                  if (trimmed && !preferredAreas.includes(trimmed) && preferredAreas.length < 12) {
                    setPreferredAreas([...preferredAreas, trimmed]);
                    setCustomAreaInput("");
                  }
                }}
                className="px-4 py-2 rounded-xl bg-sand text-charcoal text-xs font-medium hover:bg-sand-dark"
              >
                Add Locality
              </button>
            </div>
          </div>

          {/* Household Boundaries */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-charcoal">
              Helpful Household Boundaries (Select all you value)
            </label>
            <div className="flex flex-wrap gap-2">
              {HOUSEHOLD_BOUNDARIES_OPTIONS.map((b) => {
                const active = householdBoundaries.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleArrayItem(householdBoundaries, b, setHouseholdBoundaries)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      active
                        ? "bg-sand border-forest text-forest font-semibold"
                        : "bg-ivory border-border text-charcoal hover:bg-sand/50"
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Non-negotiables */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-charcoal">
              Personal Non-Negotiables (Displayed clearly on your profile)
            </label>
            <div className="flex flex-wrap gap-2">
              {NON_NEGOTIABLES_OPTIONS.map((item) => {
                const active = nonNegotiables.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem(nonNegotiables, item, setNonNegotiables)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      active
                        ? "bg-terracotta/15 border-terracotta text-terracotta-dark font-semibold"
                        : "bg-ivory border-border text-charcoal hover:bg-sand/50"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PREFERENCE IMPORTANCE & DEAL-BREAKERS */}
      {step === 5 && (
        <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-6">
          <div>
            <h2 className="font-serif text-2xl text-charcoal">
              5. Preference Importance & Deal-Breakers
            </h2>
            <p className="text-xs text-muted mt-1">
              Customize how much each topic weighs in your Peace Score (Low = 0.6×, Medium = 1.0×, High = 1.5×), or toggle <strong>Deal-Breaker</strong> for strict boundaries.
            </p>
          </div>

          <div className="divide-y divide-border">
            {ALL_IMPORTANCE_QUESTIONS.map((q) => {
              const current = importanceMap[q.key] ?? {
                importance: "medium",
                is_dealbreaker: false,
              };
              return (
                <div
                  key={q.key}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {q.category}
                    </span>
                    <p className="text-sm font-medium text-charcoal">{q.label}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(["low", "medium", "high"] as ImportanceLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() =>
                          setImportanceMap((prev) => ({
                            ...prev,
                            [q.key]: { ...current, importance: lvl },
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition ${
                          current.importance === lvl
                            ? "bg-forest text-ivory border-forest"
                            : "bg-ivory text-muted border-border hover:text-charcoal"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}

                    <label
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs cursor-pointer ml-1 transition-all ${
                        current.is_dealbreaker
                          ? "border-terracotta bg-terracotta/15 text-terracotta-dark font-semibold ring-1 ring-terracotta/30"
                          : "border-border bg-ivory text-muted hover:text-charcoal hover:border-terracotta/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={current.is_dealbreaker}
                        onChange={(e) =>
                          setImportanceMap((prev) => ({
                            ...prev,
                            [q.key]: { ...current, is_dealbreaker: e.target.checked },
                          }))
                        }
                        className="rounded border-border text-terracotta accent-terracotta"
                      />
                      <span>Strict Deal-breaker</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 6: REVIEW & EXPLICIT PUBLISH */}
      {step === 6 && (
        <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="font-serif text-2xl text-charcoal">
                6. Review & Publish Your Profile
              </h2>
              <p className="text-xs text-muted mt-1">
                Review your answers below. Your profile only appears in discovery when you explicitly publish it.
              </p>
            </div>
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                isPublished
                  ? "bg-forest/15 text-forest"
                  : "bg-sand text-charcoal"
              }`}
            >
              {isPublished ? "Currently Published" : "Currently Unpublished (Draft)"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-ivory border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-base text-charcoal">Identity & City</h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-forest font-semibold underline"
                >
                  Edit
                </button>
              </div>
              <p>
                <strong>Name:</strong> {firstName || "Not set"}
              </p>
              <p>
                <strong>City:</strong> {city}
              </p>
              <p>
                <strong>Search Intent:</strong> {formatValueLabel(searchIntent)}
              </p>
              <p>
                <strong>Occupation:</strong> {occupationTitle || formatValueLabel(occupationCategory)}
              </p>
              <p>
                <strong>Bio:</strong> {bio || "No bio added"}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ivory border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-base text-charcoal">Budget & Neighbourhoods</h3>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="text-forest font-semibold underline"
                >
                  Edit
                </button>
              </div>
              <p>
                <strong>Monthly Budget:</strong> ₹{Number(budgetMin || 0).toLocaleString("en-IN")} – ₹
                {Number(budgetMax || 0).toLocaleString("en-IN")}/mo
              </p>
              <p>
                <strong>Moving Timeline:</strong> {formatValueLabel(movingTimeline)}
              </p>
              <p>
                <strong>Arrangement:</strong> {formatValueLabel(livingArrangement)}
              </p>
              <p>
                <strong>Preferred Areas:</strong>{" "}
                {preferredAreas.length > 0 ? preferredAreas.join(", ") : "Flexible across city"}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-ivory border border-border space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-base text-charcoal">
                Lifestyle & Communication Snapshot
              </h3>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-forest font-semibold underline"
              >
                Edit Answers
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {Object.entries({ ...lifestyle, ...personality }).map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-xl bg-white border border-border">
                  <span className="block text-[10px] uppercase tracking-wider text-muted">
                    {k.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium text-charcoal">{formatValueLabel(v)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-sand/70 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-forest">
                <ShieldCheck className="w-4 h-4 text-terracotta" />
                <span>Explicit Publication Control</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Publishing makes your profile visible to other verified, active flatmate seekers in discovery while keeping your email and contact details private.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  const ok = await persistProgress(6, { completed: true, publish: false });
                  if (ok) router.push("/profile");
                }}
                className="px-5 py-2.5 rounded-full border border-border bg-white hover:bg-ivory text-xs font-medium text-charcoal transition"
              >
                Save as Private Draft
              </button>

              <button
                type="button"
                disabled={saving}
                data-testid="publish-profile-button"
                onClick={async () => {
                  const ok = await persistProgress(6, { completed: true, publish: true });
                  if (ok) {
                    router.push("/discover");
                    router.refresh();
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest hover:bg-forest-light text-ivory text-xs font-semibold shadow-warm transition"
              >
                <Sparkles className="w-4 h-4" />
                {saving ? "Publishing..." : "Publish Profile & Explore Matches"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={step <= 1 || saving}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-white hover:bg-sand disabled:opacity-40 text-sm font-medium text-charcoal transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {step < 6 && (
          <button
            type="button"
            disabled={saving}
            onClick={() => persistProgress(step + 1)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest hover:bg-forest-light disabled:opacity-60 text-ivory text-sm font-medium transition"
          >
            <span>{saving ? "Saving..." : "Save & Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
