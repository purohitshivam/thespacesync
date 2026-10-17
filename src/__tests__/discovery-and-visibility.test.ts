import { describe, it, expect } from "vitest";
import { filterAndRankDiscoveryCandidates } from "@/lib/discovery/filter";
import type { FullUserProfile } from "@/types/database";

function makeCandidate(
  id: string,
  overrides?: {
    city?: string;
    is_published?: boolean;
    onboarding_completed?: boolean;
    age_confirmed_18_plus?: boolean;
    account_status?: "active" | "suspended" | "deleted";
    discoverable?: boolean;
    budget_min_inr?: number;
    budget_max_inr?: number;
    preferred_areas?: string[];
    moving_timeline?: "immediate" | "within_1_month" | "1_to_3_months" | "flexible_3_plus_months";
    sleep_schedule?: "early_bird" | "balanced" | "night_owl" | "flexible_shift";
    dietary_preference?: "strict_veg_kitchen" | "veg_preferred_flexible" | "non_veg_comfortable" | "vegan";
    isCandidatePremium?: boolean;
  }
): FullUserProfile & { isCandidatePremium?: boolean } {
  return {
    profile: {
      id,
      first_name: `User_${id.slice(-4)}`,
      age_confirmed_18_plus: overrides?.age_confirmed_18_plus ?? true,
      birth_year: 1998,
      avatar_url: null,
      bio: "",
      occupation_title: "Engineer",
      occupation_category: "working_professional",
      institution_or_company: "",
      city: overrides?.city ?? "Bangalore",
      search_intent: "looking_for_flatmate",
      onboarding_step: 6,
      onboarding_completed: overrides?.onboarding_completed ?? true,
      is_published: overrides?.is_published ?? true,
      is_email_verified: true,
      account_status: overrides?.account_status ?? "active",
      is_admin: false,
      last_active_at: "2026-10-17T00:00:00Z",
      created_at: "2026-10-17T00:00:00Z",
      updated_at: "2026-10-17T00:00:00Z",
    },
    lifestyle: {
      user_id: id,
      sleep_schedule: overrides?.sleep_schedule ?? "balanced",
      cleanliness_level: "tidy_shared_spaces",
      cooking_habits: "daily_cook",
      dietary_preference: overrides?.dietary_preference ?? "veg_preferred_flexible",
      smoking_preference: "never",
      guests_overnight: "occasional_with_notice",
      noise_tolerance: "moderate_daytime",
      socialising_at_home: "small_dinners_boardgames",
      work_study_routine: "hybrid",
      pet_preference: "no_pets",
      chore_arrangement: "hired_househelp",
    },
    personality: {
      user_id: id,
      social_interaction_level: "friendly_checkins",
      energy_orientation: "ambivert_balanced",
      communication_style: "direct_and_immediate",
      conflict_resolution: "address_early_calmly",
      home_atmosphere: "warm_cozy_shared",
      shared_vs_independent_time: "50_50_balanced",
    },
    living: {
      user_id: id,
      budget_min_inr: overrides?.budget_min_inr ?? 18000,
      budget_max_inr: overrides?.budget_max_inr ?? 28000,
      preferred_areas: overrides?.preferred_areas ?? ["Indiranagar"],
      moving_timeline: overrides?.moving_timeline ?? "within_1_month",
      living_arrangement: "private_room_2bhk",
      household_boundaries: [],
      non_negotiables: [],
    },
    importance: [],
    privacy: {
      user_id: id,
      discoverable_in_search: overrides?.discoverable ?? true,
      show_institution_or_company: true,
      show_exact_neighborhoods: true,
      share_contact_with_matches: false,
      contact_phone_or_handle: "",
      notify_new_interests: true,
      notify_mutual_matches: true,
      notify_messages: true,
    },
    isCandidatePremium: overrides?.isCandidatePremium ?? false,
  };
}

describe("Discovery Filtering, Visibility & Security Exclusions", () => {
  const viewerId = "00000000-0000-4000-8000-000000000001";
  const viewerProfile = makeCandidate(viewerId);

  it("returns an honest empty state when database has 0 profiles", () => {
    const res = filterAndRankDiscoveryCandidates({
      candidates: [],
      viewerProfile,
      viewerUserId: viewerId,
      blockedUserIds: new Set(),
      isPremiumViewer: false,
      filters: {},
    });

    expect(res.items).toHaveLength(0);
    expect(res.totalCount).toBe(0);
  });

  it("strictly excludes current user, unpublished profiles, incomplete profiles, suspended accounts, and blocked users", () => {
    const candidates = [
      makeCandidate(viewerId), // self
      makeCandidate("u-unpublished", { is_published: false }),
      makeCandidate("u-incomplete", { onboarding_completed: false }),
      makeCandidate("u-underage-unconfirmed", { age_confirmed_18_plus: false }),
      makeCandidate("u-suspended", { account_status: "suspended" }),
      makeCandidate("u-hidden-privacy", { discoverable: false }),
      makeCandidate("u-blocked"),
      makeCandidate("u-eligible"),
    ];

    const res = filterAndRankDiscoveryCandidates({
      candidates,
      viewerProfile,
      viewerUserId: viewerId,
      blockedUserIds: new Set(["u-blocked"]),
      isPremiumViewer: false,
      filters: {},
    });

    expect(res.totalCount).toBe(1);
    expect(res.items[0]?.candidate.profile.id).toBe("u-eligible");
  });

  it("filters accurately by city, neighbourhood, budget, moving timeline, and lifestyle", () => {
    const candidates = [
      makeCandidate("u-blr-indiranagar", {
        city: "Bangalore",
        preferred_areas: ["Indiranagar", "Domlur"],
        budget_min_inr: 20000,
        budget_max_inr: 30000,
        moving_timeline: "immediate",
      }),
      makeCandidate("u-mum-bandra", {
        city: "Mumbai",
        preferred_areas: ["Bandra West"],
        budget_min_inr: 35000,
        budget_max_inr: 50000,
        moving_timeline: "immediate",
      }),
    ];

    const blrRes = filterAndRankDiscoveryCandidates({
      candidates,
      viewerProfile,
      viewerUserId: viewerId,
      blockedUserIds: new Set(),
      isPremiumViewer: false,
      filters: {
        city: "Bangalore",
        area: "Indiranagar",
        maxBudgetInr: 25000,
        movingTimeline: "immediate",
      },
    });

    expect(blrRes.totalCount).toBe(1);
    expect(blrRes.items[0]?.candidate.profile.id).toBe("u-blr-indiranagar");
  });

  it("enforces Premium entitlement before applying advanced filters", () => {
    const candidates = [
      makeCandidate("u-strict-veg", { dietary_preference: "strict_veg_kitchen" }),
      makeCandidate("u-non-veg", { dietary_preference: "non_veg_comfortable" }),
    ];

    // Free viewer attempting to pass dietaryPreference filter: ignored on server
    const freeRes = filterAndRankDiscoveryCandidates({
      candidates,
      viewerProfile,
      viewerUserId: viewerId,
      blockedUserIds: new Set(),
      isPremiumViewer: false,
      filters: { dietaryPreference: "strict_veg_kitchen" },
    });
    expect(freeRes.totalCount).toBe(2);

    // Premium viewer: advanced filter is applied on server
    const premiumRes = filterAndRankDiscoveryCandidates({
      candidates,
      viewerProfile,
      viewerUserId: viewerId,
      blockedUserIds: new Set(),
      isPremiumViewer: true,
      filters: { dietaryPreference: "strict_veg_kitchen" },
    });
    expect(premiumRes.totalCount).toBe(1);
    expect(premiumRes.items[0]?.candidate.profile.id).toBe("u-strict-veg");
  });

  it("sorts by Peace Score descending and supports server-side pagination", () => {
    const candidates = [
      makeCandidate("u-low", {
        city: "Mumbai",
        sleep_schedule: "night_owl",
        budget_min_inr: 70000,
        budget_max_inr: 90000,
      }),
      makeCandidate("u-high", {
        city: "Bangalore",
        sleep_schedule: "balanced",
        budget_min_inr: 18000,
        budget_max_inr: 28000,
      }),
    ];

    const res = filterAndRankDiscoveryCandidates({
      candidates,
      viewerProfile,
      viewerUserId: viewerId,
      blockedUserIds: new Set(),
      isPremiumViewer: false,
      filters: { sortBy: "peace_score", page: 1, pageSize: 1 },
    });

    expect(res.totalCount).toBe(2);
    expect(res.totalPages).toBe(2);
    expect(res.items).toHaveLength(1);
    expect(res.items[0]?.candidate.profile.id).toBe("u-high");
  });
});
