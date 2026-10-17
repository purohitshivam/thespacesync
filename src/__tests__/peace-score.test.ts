import { describe, it, expect } from "vitest";
import {
  calculatePeaceScore,
  DEFAULT_PEACE_SCORE_CONFIG,
} from "@/lib/peace-score";
import type { FullUserProfile } from "@/types/database";

function createTestProfile(overrides?: Partial<FullUserProfile>): FullUserProfile {
  return {
    profile: {
      id: "00000000-0000-4000-8000-000000000001",
      first_name: "TestUserA",
      age_confirmed_18_plus: true,
      birth_year: 1999,
      avatar_url: null,
      bio: "Test bio",
      occupation_title: "Product Manager",
      occupation_category: "working_professional",
      institution_or_company: "TestCorp",
      city: "Bangalore",
      search_intent: "looking_for_flatmate",
      onboarding_step: 6,
      onboarding_completed: true,
      is_published: true,
      is_email_verified: true,
      account_status: "active",
      is_admin: false,
      last_active_at: "2026-10-17T00:00:00Z",
      created_at: "2026-10-17T00:00:00Z",
      updated_at: "2026-10-17T00:00:00Z",
      ...(overrides?.profile ?? {}),
    },
    lifestyle:
      overrides?.lifestyle !== undefined
        ? overrides.lifestyle
        : {
            user_id: "00000000-0000-4000-8000-000000000001",
            sleep_schedule: "balanced",
            cleanliness_level: "tidy_shared_spaces",
            cooking_habits: "daily_cook",
            dietary_preference: "veg_preferred_flexible",
            smoking_preference: "never",
            guests_overnight: "occasional_with_notice",
            noise_tolerance: "moderate_daytime",
            socialising_at_home: "small_dinners_boardgames",
            work_study_routine: "hybrid",
            pet_preference: "love_pets_dont_own",
            chore_arrangement: "hired_househelp",
          },
    personality:
      overrides?.personality !== undefined
        ? overrides.personality
        : {
            user_id: "00000000-0000-4000-8000-000000000001",
            social_interaction_level: "friendly_checkins",
            energy_orientation: "ambivert_balanced",
            communication_style: "direct_and_immediate",
            conflict_resolution: "address_early_calmly",
            home_atmosphere: "warm_cozy_shared",
            shared_vs_independent_time: "50_50_balanced",
          },
    living:
      overrides?.living !== undefined
        ? overrides.living
        : {
            user_id: "00000000-0000-4000-8000-000000000001",
            budget_min_inr: 18000,
            budget_max_inr: 28000,
            preferred_areas: ["Indiranagar", "Koramangala"],
            moving_timeline: "within_1_month",
            living_arrangement: "private_room_2bhk",
            household_boundaries: [],
            non_negotiables: [],
          },
    importance: overrides?.importance ?? [],
  };
}

describe("Peace Score Deterministic Compatibility Engine", () => {
  it("uses initial configurable default weights of 40% Lifestyle, 40% Living, 20% Personality", () => {
    expect(DEFAULT_PEACE_SCORE_CONFIG.weights.lifestyle).toBe(0.4);
    expect(DEFAULT_PEACE_SCORE_CONFIG.weights.living).toBe(0.4);
    expect(DEFAULT_PEACE_SCORE_CONFIG.weights.personality).toBe(0.2);
  });

  it("produces deterministic, identical results across repeated calls for the same profiles", () => {
    const userA = createTestProfile();
    const userB = createTestProfile({
      profile: {
        ...userA.profile,
        id: "00000000-0000-4000-8000-000000000002",
        first_name: "TestUserB",
        search_intent: "have_shared_space",
      },
    });

    const firstRun = calculatePeaceScore(userA, userB);
    const secondRun = calculatePeaceScore(userA, userB);

    expect(firstRun.overallScore).toBe(secondRun.overallScore);
    expect(firstRun.overallScore).toBeGreaterThanOrEqual(95);
    expect(firstRun.status).toBe("complete");
    expect(firstRun.completenessPercentage).toBe(100);
  });

  it("excludes missing answers from the relevant category denominator rather than penalising", () => {
    const userA = createTestProfile();
    // User B only answered 2 lifestyle questions (identically to A), 2 living questions, and 1 personality question
    const userB = createTestProfile({
      profile: {
        ...userA.profile,
        id: "00000000-0000-4000-8000-000000000002",
      },
      lifestyle: {
        user_id: "00000000-0000-4000-8000-000000000002",
        sleep_schedule: "balanced",
        cleanliness_level: "tidy_shared_spaces",
        cooking_habits: null,
        dietary_preference: null,
        smoking_preference: null,
        guests_overnight: null,
        noise_tolerance: null,
        socialising_at_home: null,
        work_study_routine: null,
        pet_preference: null,
        chore_arrangement: null,
      },
      living: {
        user_id: "00000000-0000-4000-8000-000000000002",
        budget_min_inr: 18000,
        budget_max_inr: 28000,
        preferred_areas: [],
        moving_timeline: "within_1_month",
        living_arrangement: null,
        household_boundaries: [],
        non_negotiables: [],
      },
      personality: {
        user_id: "00000000-0000-4000-8000-000000000002",
        social_interaction_level: "friendly_checkins",
        energy_orientation: null,
        communication_style: null,
        conflict_resolution: null,
        home_atmosphere: null,
        shared_vs_independent_time: null,
      },
    });

    const result = calculatePeaceScore(userA, userB);

    // Since all answered questions match 100% (except search_intent looking+looking=92),
    // lifestyle and personality category scores must be 100, proving missing answers were excluded from denominator!
    expect(result.categories.lifestyle.answeredCount).toBe(2);
    expect(result.categories.lifestyle.score).toBe(100);
    expect(result.categories.personality.answeredCount).toBe(1);
    expect(result.categories.personality.score).toBe(100);
    expect(result.overallScore).toBeGreaterThanOrEqual(95);
    expect(result.status).toBe("partial_data");
  });

  it("returns incomplete_data state with null overallScore when fewer than 4 dimensions are mutually answered", () => {
    const userA = createTestProfile({
      lifestyle: null,
      personality: null,
      living: null,
    });
    const userB = createTestProfile({
      lifestyle: null,
      personality: null,
      living: null,
    });

    const result = calculatePeaceScore(userA, userB);

    expect(result.status).toBe("incomplete_data");
    expect(result.overallScore).toBeNull();
    expect(result.completenessLabel).toBe("Insufficient Data");
  });

  it("recognises complementary preferences rather than treating all differences as incompatible", () => {
    const userA = createTestProfile();
    const userB = createTestProfile({
      profile: {
        ...userA.profile,
        id: "00000000-0000-4000-8000-000000000002",
        search_intent: "have_shared_space", // complements A's looking_for_flatmate
      },
      lifestyle: {
        ...userA.lifestyle!,
        cooking_habits: "mostly_order_in", // complements A's daily_cook
        pet_preference: "have_pets", // complements A's love_pets_dont_own
      },
      personality: {
        ...userA.personality!,
        energy_orientation: "recharge_alone",
      },
    });

    const result = calculatePeaceScore(userA, userB);
    const cookingDim = result.dimensions.find((d) => d.key === "cooking_habits");
    const petDim = result.dimensions.find((d) => d.key === "pet_preference");
    const intentDim = result.dimensions.find((d) => d.key === "search_intent");

    expect(cookingDim?.rawScore).toBeGreaterThanOrEqual(90);
    expect(cookingDim?.alignment).toBe("complementary");
    expect(petDim?.rawScore).toBe(100);
    expect(intentDim?.rawScore).toBe(100);
  });

  it("flags deal-breakers separately and caps the overall score when a designated deal-breaker conflicts", () => {
    const userA = createTestProfile({
      importance: [
        {
          user_id: "00000000-0000-4000-8000-000000000001",
          question_key: "smoking_preference",
          importance: "high",
          is_dealbreaker: true,
        },
      ],
    });

    const userB = createTestProfile({
      profile: {
        ...userA.profile,
        id: "00000000-0000-4000-8000-000000000002",
      },
      lifestyle: {
        ...userA.lifestyle!,
        smoking_preference: "occasionally_indoors", // clashes with A's "never"
      },
    });

    const result = calculatePeaceScore(userA, userB);

    expect(result.hasDealbreakerConflict).toBe(true);
    expect(result.dealbreakerConflicts).toHaveLength(1);
    expect(result.dealbreakerConflicts[0]?.questionKey).toBe("smoking_preference");
    expect(result.unpenalisedScore).toBeGreaterThan(75);
    expect(result.overallScore).toBeLessThanOrEqual(DEFAULT_PEACE_SCORE_CONFIG.dealbreakerCapScore);
  });

  it("respects custom central category weights when configured", () => {
    const userA = createTestProfile();
    const userB = createTestProfile({
      profile: { ...userA.profile, id: "00000000-0000-4000-8000-000000000002" },
      living: {
        ...userA.living!,
        budget_min_inr: 65000,
        budget_max_inr: 80000, // disjoint budget
        moving_timeline: "1_to_3_months",
      },
    });

    const livingHeavy = calculatePeaceScore(userA, userB, {
      weights: { lifestyle: 0.1, living: 0.8, personality: 0.1 },
    });
    const lifestyleHeavy = calculatePeaceScore(userA, userB, {
      weights: { lifestyle: 0.8, living: 0.1, personality: 0.1 },
    });

    expect(lifestyleHeavy.overallScore!).toBeGreaterThan(livingHeavy.overallScore!);
  });
});
