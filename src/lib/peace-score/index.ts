import type {
  FullUserProfile,
  ImportanceLevel,
  PreferenceImportanceRow,
} from "@/types/database";

export interface PeaceScoreWeights {
  lifestyle: number;
  living: number;
  personality: number;
}

export interface PeaceScoreConfig {
  weights: PeaceScoreWeights;
  importanceMultipliers: Record<ImportanceLevel, number>;
  minAnsweredQuestionsForScore: number;
  dealbreakerThresholdScore: number;
  dealbreakerCapScore: number;
}

export const DEFAULT_PEACE_SCORE_CONFIG: PeaceScoreConfig = {
  weights: {
    lifestyle: 0.4,
    living: 0.4,
    personality: 0.2,
  },
  importanceMultipliers: {
    low: 0.6,
    medium: 1.0,
    high: 1.5,
  },
  minAnsweredQuestionsForScore: 4,
  dealbreakerThresholdScore: 35,
  dealbreakerCapScore: 49,
};

export type PeaceScoreCategory = "lifestyle" | "living" | "personality";

export interface ScoredDimension {
  key: string;
  label: string;
  category: PeaceScoreCategory;
  rawScore: number; // 0 to 100
  effectiveWeight: number;
  userAValueLabel: string;
  userBValueLabel: string;
  explanation: string;
  alignment: "strong" | "complementary" | "moderate" | "friction";
  dealbreakerTriggeredBy: ("userA" | "userB")[];
}

export interface DealbreakerConflict {
  questionKey: string;
  questionLabel: string;
  triggeredBy: ("userA" | "userB")[];
  rawScore: number;
  reason: string;
}

export interface CategoryScoreSummary {
  category: PeaceScoreCategory;
  label: string;
  configuredWeight: number; // e.g., 0.40
  activeWeight: number; // redistributed if another category has 0 answers
  score: number | null; // 0 to 100, or null if no mutually answered questions in this category
  answeredCount: number;
  totalCount: number;
}

export interface PeaceScoreResult {
  status: "complete" | "partial_data" | "incomplete_data";
  overallScore: number | null; // 0 to 100, or null when status === 'incomplete_data'
  unpenalisedScore: number | null;
  hasDealbreakerConflict: boolean;
  dealbreakerConflicts: DealbreakerConflict[];
  completenessPercentage: number; // 0 to 100
  answeredQuestionsCount: number;
  totalQuestionsCount: number;
  completenessLabel: "High Completeness" | "Moderate Completeness" | "Insufficient Data";
  categories: {
    lifestyle: CategoryScoreSummary;
    living: CategoryScoreSummary;
    personality: CategoryScoreSummary;
  };
  dimensions: ScoredDimension[];
  similarities: ScoredDimension[];
  differences: ScoredDimension[];
  disclaimer: string;
}

const DISCLAIMER_TEXT =
  "Peace Score is a transparent, rules-based compatibility estimate calculated from your self-reported preferences. It is a conversation starter — not a scientific validation or guarantee of a flatmate relationship.";

function buildImportanceLookup(
  rows: PreferenceImportanceRow[]
): Map<string, { importance: ImportanceLevel; is_dealbreaker: boolean }> {
  const map = new Map<string, { importance: ImportanceLevel; is_dealbreaker: boolean }>();
  for (const r of rows || []) {
    map.set(r.question_key, {
      importance: r.importance || "medium",
      is_dealbreaker: Boolean(r.is_dealbreaker),
    });
  }
  return map;
}

function getCombinedWeight(
  key: string,
  mapA: Map<string, { importance: ImportanceLevel; is_dealbreaker: boolean }>,
  mapB: Map<string, { importance: ImportanceLevel; is_dealbreaker: boolean }>,
  config: PeaceScoreConfig
): { weight: number; dealbreakerTriggeredBy: ("userA" | "userB")[] } {
  const prefA = mapA.get(key);
  const prefB = mapB.get(key);

  const multA = config.importanceMultipliers[prefA?.importance ?? "medium"] ?? 1.0;
  const multB = config.importanceMultipliers[prefB?.importance ?? "medium"] ?? 1.0;
  const weight = (multA + multB) / 2;

  const dealbreakerTriggeredBy: ("userA" | "userB")[] = [];
  if (prefA?.is_dealbreaker) dealbreakerTriggeredBy.push("userA");
  if (prefB?.is_dealbreaker) dealbreakerTriggeredBy.push("userB");

  return { weight, dealbreakerTriggeredBy };
}

function classifyAlignment(score: number, isComplementary = false): ScoredDimension["alignment"] {
  if (isComplementary && score >= 75) return "complementary";
  if (score >= 78) return "strong";
  if (score >= 50) return "moderate";
  return "friction";
}

// Human-readable value formatters
export const VALUE_LABELS: Record<string, string> = {
  // Sleep
  early_bird: "Early bird (up by 6–7 AM)",
  balanced: "Balanced (11 PM – 7:30 AM)",
  night_owl: "Night owl (up past 1 AM)",
  flexible_shift: "Flexible / irregular schedule",
  // Cleanliness
  spotless: "Spotless & organised daily",
  tidy_shared_spaces: "Tidy in shared spaces",
  weekly_deep_clean: "Weekly scheduled clean",
  relaxed: "Relaxed & lived-in",
  // Cooking
  daily_cook: "Cooks almost daily",
  occasional_cook: "Cooks 2–3 times a week",
  meal_prep_weekends: "Batch meal-preps on weekends",
  mostly_order_in: "Mostly orders in / tiffin",
  // Diet
  strict_veg_kitchen: "Strictly vegetarian kitchen",
  veg_preferred_flexible: "Vegetarian (comfortable with all kitchens)",
  non_veg_comfortable: "Eats non-veg / open kitchen",
  vegan: "Plant-based / vegan",
  // Smoking
  never: "Strictly smoke-free",
  outside_only: "Outdoors / balcony only",
  occasionally_indoors: "Occasionally indoors",
  tolerant: "Non-smoker, comfortable around smokers",
  // Guests
  rarely: "Rarely hosts overnight guests",
  occasional_with_notice: "Occasional guests with heads-up",
  weekends_welcome: "Friends welcome on weekends",
  anytime_open: "Open-door / frequent visitors",
  // Noise
  quiet_sanctuary: "Quiet sanctuary",
  moderate_daytime: "Moderate daytime activity",
  lively_music_friendly: "Lively & music-friendly",
  // Socialising at home
  quiet_retreat: "Home is a quiet retreat",
  small_dinners_boardgames: "Small dinners & board games",
  frequent_gatherings: "Frequent social hosting",
  // Work routine
  mostly_office_campus: "At office / campus most days",
  hybrid: "Hybrid (2–3 days WFH)",
  mostly_from_home: "Works / studies mostly from home",
  late_study_hours: "Late-night study / work sessions",
  // Pets
  no_pets: "Prefers a pet-free home",
  have_pets: "Has a pet moving in",
  love_pets_dont_own: "Loves pets (doesn't own one)",
  allergic: "Allergic to pets",
  // Chores
  shared_roster: "Structured chore roster",
  hired_househelp: "Prefers hiring shared househelp",
  clean_as_you_go: "Clean as you go",
  flexible: "Flexible / easygoing",
  // Social interaction
  mostly_independent: "Warm & independent routines",
  friendly_checkins: "Friendly daily kitchen chats",
  hangout_regularly: "Regular shared meals & outings",
  close_friends_vibe: "Looking for a close-knit home community",
  // Energy
  recharge_alone: "Recharges with quiet solo time",
  ambivert_balanced: "Balanced mix of solo & social energy",
  energised_by_company: "Energised by company & conversation",
  // Communication
  direct_and_immediate: "Direct & immediate conversation",
  gentle_in_person: "Gentle, scheduled in-person chat",
  async_message_first: "WhatsApp / message first to bring up topics",
  scheduled_house_sync: "Periodic house check-ins",
  // Conflict
  address_early_calmly: "Addresses small things early & calmly",
  cool_off_then_talk: "Takes time to reflect before talking",
  written_note_first: "Prefers writing thoughts down first",
  compromise_focused: "Pragmatic & middle-ground focused",
  // Atmosphere
  calm_minimalist: "Calm, uncluttered & minimalist",
  warm_cozy_shared: "Warm, cozy & plant-filled",
  creative_bustling: "Creative, expressive & lively",
  structured_academic: "Focused, study/work oriented",
  // Shared vs independent time
  "80_independent_20_shared": "80% independent / 20% shared",
  "50_50_balanced": "50% independent / 50% shared",
  "30_independent_70_shared": "30% independent / 70% shared",
  // Moving timeline
  immediate: "Immediate (within 2 weeks)",
  within_1_month: "Within 1 month",
  "1_to_3_months": "In 1 to 3 months",
  flexible_3_plus_months: "3+ months / flexible",
  // Living arrangement
  private_room_2bhk: "Private room in a 2BHK",
  private_room_3bhk: "Private room in a 3BHK+",
  shared_room: "Shared room",
  studio_coliving: "Studio / co-living setup",
  // Search intent
  looking_for_flatmate: "Looking for a flatmate to find a place together",
  have_shared_space: "Has a flat/room and looking for a flatmate",
  exploring_both: "Open to existing flat or hunting together",
};

export function formatValueLabel(val: string | null | undefined): string {
  if (!val) return "Not specified";
  return VALUE_LABELS[val] ?? val;
}

// ============================================================================
// PAIRWISE SCORING RULES BY QUESTION
// ============================================================================

function scoreSleepSchedule(a: string, b: string): { score: number; explanation: string } {
  if (a === b) {
    return { score: 100, explanation: "You share the exact same daily sleep and wake rhythm." };
  }
  const pair = [a, b].sort().join("|");
  switch (pair) {
    case "balanced|early_bird":
    case "balanced|night_owl":
      return { score: 80, explanation: "Your sleep schedules overlap comfortably with minor morning/evening offsets." };
    case "balanced|flexible_shift":
    case "early_bird|flexible_shift":
    case "flexible_shift|night_owl":
      return { score: 75, explanation: "Flexible routines adapt well as long as quiet hours are respected." };
    case "early_bird|night_owl":
      return {
        score: 45,
        explanation: "One of you is an early riser and the other is a night owl — agreeing on quiet hours is helpful.",
      };
    default:
      return { score: 70, explanation: "Your sleep schedules have moderate overlap." };
  }
}

function scoreCleanliness(a: string, b: string): { score: number; explanation: string } {
  if (a === b) {
    return { score: 100, explanation: "You hold the same expectations for household tidiness." };
  }
  const pair = [a, b].sort().join("|");
  switch (pair) {
    case "spotless|tidy_shared_spaces":
    case "spotless|weekly_deep_clean":
    case "tidy_shared_spaces|weekly_deep_clean":
      return { score: 85, explanation: "Both of you value clean common areas with compatible upkeep routines." };
    case "relaxed|tidy_shared_spaces":
    case "relaxed|weekly_deep_clean":
      return {
        score: 55,
        explanation: "Slightly different tidiness standards — keeping shared areas clear avoids friction.",
      };
    case "relaxed|spotless":
      return {
        score: 20,
        explanation: "Contrasting cleanliness expectations (spotless vs relaxed) often require clear house rules.",
      };
    default:
      return { score: 70, explanation: "Moderately aligned cleanliness habits." };
  }
}

function scoreCookingHabits(
  a: string,
  b: string
): { score: number; explanation: string; isComplementary: boolean } {
  if (a === b) {
    if (a === "daily_cook") {
      return {
        score: 88,
        explanation: "Both cook daily — great for shared groceries or coordinating stove times.",
        isComplementary: false,
      };
    }
    return { score: 100, explanation: "Similar kitchen usage frequency.", isComplementary: false };
  }
  const pair = [a, b].sort().join("|");
  // Different cooking frequencies are actually complementary because the kitchen is never crowded!
  if (pair === "daily_cook|mostly_order_in" || pair === "meal_prep_weekends|mostly_order_in") {
    return {
      score: 92,
      explanation: "Complementary kitchen routines — one cooks regularly while the other rarely crowds the stove.",
      isComplementary: true,
    };
  }
  return {
    score: 85,
    explanation: "Balanced kitchen habits that rarely conflict during peak hours.",
    isComplementary: true,
  };
}

function scoreDietaryPreference(a: string, b: string): { score: number; explanation: string } {
  if (a === b) {
    return { score: 100, explanation: "Fully aligned kitchen dietary preferences." };
  }
  const pair = [a, b].sort().join("|");
  switch (pair) {
    case "strict_veg_kitchen|vegan":
      return { score: 90, explanation: "Both prefer a meat-free kitchen environment." };
    case "strict_veg_kitchen|veg_preferred_flexible":
    case "vegan|veg_preferred_flexible":
      return { score: 85, explanation: "Compatible vegetarian/plant-based kitchen habits." };
    case "non_veg_comfortable|veg_preferred_flexible":
    case "non_veg_comfortable|vegan":
      return {
        score: 72,
        explanation: "Different diets, though flexible about shared kitchen usage (separate utensils help).",
      };
    case "non_veg_comfortable|strict_veg_kitchen":
      return {
        score: 15,
        explanation: "Direct clash between a strictly vegetarian kitchen requirement and non-vegetarian cooking.",
      };
    default:
      return { score: 75, explanation: "Workable dietary preferences." };
  }
}

function scoreSmokingPreference(a: string, b: string): { score: number; explanation: string } {
  if (a === b) {
    return { score: 100, explanation: "Identical preferences around smoking at home." };
  }
  const pair = [a, b].sort().join("|");
  switch (pair) {
    case "never|tolerant":
    case "outside_only|tolerant":
    case "occasionally_indoors|tolerant":
      return { score: 88, explanation: "Comfortable boundaries around smoking." };
    case "never|outside_only":
      return {
        score: 55,
        explanation: "One prefers a strictly smoke-free home while the other smokes outdoors/on the balcony.",
      };
    case "occasionally_indoors|outside_only":
      return { score: 65, explanation: "Both smoke, though one prefers keeping it strictly outdoors." };
    case "never|occasionally_indoors":
      return {
        score: 10,
        explanation: "Significant mismatch between a strictly smoke-free preference and indoor smoking.",
      };
    default:
      return { score: 60, explanation: "Discuss balcony/outdoor smoking boundaries upfront." };
  }
}

function scoreGuestsOvernight(a: string, b: string): { score: number; explanation: string } {
  const order = ["rarely", "occasional_with_notice", "weekends_welcome", "anytime_open"];
  const idxA = order.indexOf(a);
  const idxB = order.indexOf(b);
  if (idxA === -1 || idxB === -1) return { score: 70, explanation: "Moderate alignment on guests." };

  const diff = Math.abs(idxA - idxB);
  if (diff === 0) {
    return { score: 100, explanation: "Identical comfort level regarding overnight guests and visitors." };
  }
  if (diff === 1) {
    return { score: 82, explanation: "Very close expectations on hosting friends with advance notice." };
  }
  if (diff === 2) {
    return { score: 45, explanation: "Different hosting frequencies — agreeing on a guest heads-up policy helps." };
  }
  return {
    score: 20,
    explanation: "Opposite expectations on overnight visitors (rarely vs open-door).",
  };
}

function scoreNoiseTolerance(a: string, b: string): { score: number; explanation: string } {
  const order = ["quiet_sanctuary", "moderate_daytime", "lively_music_friendly"];
  const idxA = order.indexOf(a);
  const idxB = order.indexOf(b);
  if (idxA === -1 || idxB === -1) return { score: 70, explanation: "Compatible acoustic preferences." };

  const diff = Math.abs(idxA - idxB);
  if (diff === 0) return { score: 100, explanation: "Same preference for home sound levels." };
  if (diff === 1) return { score: 78, explanation: "Easy balance between quiet hours and daytime activity." };
  return {
    score: 25,
    explanation: "One seeks a quiet sanctuary while the other enjoys a lively, music-friendly home.",
  };
}

function scoreSocialisingAtHome(a: string, b: string): { score: number; explanation: string } {
  const order = ["quiet_retreat", "small_dinners_boardgames", "frequent_gatherings"];
  const idxA = order.indexOf(a);
  const idxB = order.indexOf(b);
  if (idxA === -1 || idxB === -1) return { score: 70, explanation: "Compatible hosting expectations." };

  const diff = Math.abs(idxA - idxB);
  if (diff === 0) return { score: 100, explanation: "Matched expectations for socialising at home." };
  if (diff === 1) return { score: 80, explanation: "Balanced approach to occasional dinners and downtime." };
  return {
    score: 30,
    explanation: "Contrasting views on home hosting (quiet retreat vs frequent gatherings).",
  };
}

function scoreWorkStudyRoutine(
  a: string,
  b: string
): { score: number; explanation: string; isComplementary: boolean } {
  if (a === b) {
    return {
      score: 95,
      explanation: "You share the same daytime work/study schedule.",
      isComplementary: false,
    };
  }
  const pair = [a, b].sort().join("|");
  if (pair === "Mostly_from_home|mostly_office_campus".toLowerCase()) {
    return {
      score: 92,
      explanation: "Complementary routines — one has the flat during the day while the other commutes.",
      isComplementary: true,
    };
  }
  return {
    score: 82,
    explanation: "Work and study schedules integrate smoothly.",
    isComplementary: false,
  };
}

function scorePetPreference(
  a: string,
  b: string
): { score: number; explanation: string; isComplementary: boolean } {
  if (a === b) {
    return { score: 100, explanation: "Aligned preferences on pets in the flat.", isComplementary: false };
  }
  const pair = [a, b].sort().join("|");
  switch (pair) {
    case "have_pets|love_pets_dont_own":
      return {
        score: 100,
        explanation: "Ideal match — one brings a pet and the other loves having animals at home.",
        isComplementary: true,
      };
    case "allergic|no_pets":
    case "love_pets_dont_own|no_pets":
    case "allergic|love_pets_dont_own":
      return {
        score: 90,
        explanation: "Neither is bringing a pet into the shared flat.",
        isComplementary: false,
      };
    case "have_pets|no_pets":
      return {
        score: 15,
        explanation: "One has a pet while the other prefers a pet-free home.",
        isComplementary: false,
      };
    case "allergic|have_pets":
      return {
        score: 0,
        explanation: "Incompatible: one has a pet and the other has pet allergies.",
        isComplementary: false,
      };
    default:
      return { score: 75, explanation: "Compatible pet preferences.", isComplementary: false };
  }
}

function scoreChoreArrangement(a: string, b: string): { score: number; explanation: string } {
  if (a === b) {
    return { score: 100, explanation: "Both prefer managing household chores the same way." };
  }
  if (a === "flexible" || b === "flexible") {
    return { score: 88, explanation: "One flatmate is flexible and happy to adapt to the household chore setup." };
  }
  const pair = [a, b].sort().join("|");
  if (pair === "clean_as_you_go|hired_househelp" || pair === "hired_househelp|shared_roster") {
    return { score: 78, explanation: "Combining daily upkeep with shared househelp is easy to coordinate." };
  }
  return { score: 65, explanation: "Worth agreeing early on whether to hire househelp or use a chore roster." };
}

function scoreBudgetOverlap(
  minA: number,
  maxA: number,
  minB: number,
  maxB: number
): { score: number; explanation: string } {
  const overlapStart = Math.max(minA, minB);
  const overlapEnd = Math.min(maxA, maxB);

  if (overlapEnd >= overlapStart) {
    const overlapSpan = overlapEnd - overlapStart;
    const minSpan = Math.max(1000, Math.min(maxA - minA, maxB - minB));
    const ratio = Math.min(1, overlapSpan / minSpan);
    const score = Math.round(80 + ratio * 20);
    return {
      score,
      explanation: `Monthly budgets overlap comfortably between ₹${overlapStart.toLocaleString("en-IN")} and ₹${overlapEnd.toLocaleString("en-IN")}.`,
    };
  }

  // Disjoint intervals: calculate gap relative to average midpoint
  const gap = overlapStart - overlapEnd;
  const midpoint = (minA + maxA + minB + maxB) / 4;
  const relativeGap = gap / Math.max(1000, midpoint);

  if (relativeGap <= 0.15) {
    return {
      score: 65,
      explanation: `Budgets are within ₹${gap.toLocaleString("en-IN")}/month of each other — workable with unequal room sizes (e.g., master vs standard bedroom).`,
    };
  }
  if (relativeGap <= 0.35) {
    return {
      score: 40,
      explanation: `Noticeable budget gap of ₹${gap.toLocaleString("en-IN")}/month; works best if splitting rent by room size/attached bath.`,
    };
  }
  return {
    score: 15,
    explanation: `Significant monthly budget gap of ₹${gap.toLocaleString("en-IN")}/month.`,
  };
}

function scorePreferredAreas(
  cityA: string,
  cityB: string,
  areasA: string[],
  areasB: string[]
): { score: number; explanation: string } {
  const normCityA = cityA.trim().toLowerCase();
  const normCityB = cityB.trim().toLowerCase();

  if (normCityA && normCityB && normCityA !== normCityB) {
    return {
      score: 15,
      explanation: `Currently looking in different cities (${cityA} vs ${cityB}).`,
    };
  }

  const setB = new Set(areasB.map((x) => x.trim().toLowerCase()).filter(Boolean));
  const seen = new Set<string>();

  const shared: string[] = [];
  for (const area of areasA) {
    const norm = area.trim().toLowerCase();
    if (norm && setB.has(norm) && !seen.has(norm)) {
      seen.add(norm);
      shared.push(area.trim());
    }
  }

  if (shared.length >= 2) {
    return {
      score: 100,
      explanation: `You both want to live in ${shared.slice(0, 3).join(", ")}.`,
    };
  }
  if (shared.length === 1) {
    return {
      score: 90,
      explanation: `You both have ${shared[0]} on your shortlist.`,
    };
  }
  return {
    score: 55,
    explanation: `Both looking in ${cityA || "the same city"}, though targeting different neighbourhoods.`,
  };
}

function scoreMovingTimeline(a: string, b: string): { score: number; explanation: string } {
  if (a === b) {
    return { score: 100, explanation: "You are targeting the exact same move-in window." };
  }
  if (a === "flexible_3_plus_months" || b === "flexible_3_plus_months") {
    return { score: 75, explanation: "One of you has a flexible moving timeline." };
  }
  const order = ["immediate", "within_1_month", "1_to_3_months"];
  const idxA = order.indexOf(a);
  const idxB = order.indexOf(b);
  if (idxA !== -1 && idxB !== -1 && Math.abs(idxA - idxB) === 1) {
    return { score: 80, explanation: "Move-in timelines are within a few weeks of each other." };
  }
  return {
    score: 35,
    explanation: "Move-in timelines are several weeks apart (immediate vs 1–3 months).",
  };
}

function scoreLivingArrangement(a: string, b: string): { score: number; explanation: string } {
  if (a === b) {
    return { score: 100, explanation: "Aligned on preferred flat configuration." };
  }
  if (a === "flexible" || b === "flexible") {
    return { score: 90, explanation: "Flexible on 2BHK/3BHK flat configuration." };
  }
  const pair = [a, b].sort().join("|");
  if (pair === "private_room_2bhk|private_room_3bhk") {
    return { score: 85, explanation: "Both want private bedrooms in a shared apartment." };
  }
  return {
    score: 40,
    explanation: "Different flat setup preferences (e.g., private bedroom vs shared room).",
  };
}

function scoreSearchIntent(
  a: string,
  b: string
): { score: number; explanation: string; isComplementary: boolean } {
  const pair = [a, b].sort().join("|");
  if (pair === "have_shared_space|looking_for_flatmate") {
    return {
      score: 100,
      explanation: "Complementary fit: one has a shared flat and the other is looking for a flatmate.",
      isComplementary: true,
    };
  }
  if (a === "exploring_both" || b === "exploring_both") {
    return {
      score: 95,
      explanation: "Open to either joining an existing flat or flat-hunting together.",
      isComplementary: true,
    };
  }
  if (a === "looking_for_flatmate" && b === "looking_for_flatmate") {
    return {
      score: 92,
      explanation: "Both looking to team up and find a flat together.",
      isComplementary: false,
    };
  }
  return {
    score: 40,
    explanation: "Both already have separate spaces — check if one is open to relocating.",
    isComplementary: false,
  };
}

function scoreSocialInteraction(a: string, b: string): { score: number; explanation: string } {
  const order = ["mostly_independent", "friendly_checkins", "hangout_regularly", "close_friends_vibe"];
  const idxA = order.indexOf(a);
  const idxB = order.indexOf(b);
  if (idxA === -1 || idxB === -1) return { score: 75, explanation: "Compatible social cadence." };
  const diff = Math.abs(idxA - idxB);
  if (diff === 0) return { score: 100, explanation: "Matched expectations for flatmate camaraderie." };
  if (diff === 1) return { score: 84, explanation: "Comfortable balance of friendly interaction and personal space." };
  if (diff === 2) return { score: 55, explanation: "Slightly different expectations for how often flatmates hang out." };
  return {
    score: 30,
    explanation: "One prefers independent routines while the other hopes for a close-knit hangout dynamic.",
  };
}

function scoreEnergyOrientation(
  a: string,
  b: string
): { score: number; explanation: string; isComplementary: boolean } {
  if (a === b) {
    return { score: 95, explanation: "Similar social energy at home.", isComplementary: false };
  }
  if (a === "ambivert_balanced" || b === "ambivert_balanced") {
    return {
      score: 90,
      explanation: "Balanced ambivert energy bridges solo downtime and social evenings naturally.",
      isComplementary: true,
    };
  }
  // Introvert + Extrovert is not incompatible!
  return {
    score: 74,
    explanation: "Different social batteries (solo recharge vs social energy) can complement each other well with clear boundaries.",
    isComplementary: true,
  };
}

function scoreCommunicationStyle(a: string, b: string): { score: number; explanation: string } {
  if (a === b) {
    return { score: 100, explanation: "You prefer communicating about house matters in the exact same way." };
  }
  const pair = [a, b].sort().join("|");
  if (pair === "direct_and_immediate|scheduled_house_sync" || pair === "gentle_in_person|scheduled_house_sync") {
    return { score: 85, explanation: "Both value open, face-to-face house communication." };
  }
  return {
    score: 72,
    explanation: "Slightly different communication channels (in-person vs message first) — easy to bridge once aware.",
  };
}

function scoreConflictResolution(a: string, b: string): { score: number; explanation: string } {
  if (a === b) {
    return { score: 100, explanation: "Shared approach to resolving household disagreements." };
  }
  if (a === "compromise_focused" || b === "compromise_focused") {
    return { score: 88, explanation: "Pragmatic, compromise-oriented mindset keeps house discussions constructive." };
  }
  const pair = [a, b].sort().join("|");
  if (pair === "address_early_calmly|cool_off_then_talk") {
    return {
      score: 75,
      explanation: "One likes addressing things immediately while the other takes a breather first — both value calm dialogue.",
    };
  }
  return { score: 72, explanation: "Constructive conflict styles that benefit from a shared feedback norm." };
}

function scoreHomeAtmosphere(a: string, b: string): { score: number; explanation: string } {
  if (a === b) {
    return { score: 100, explanation: "You envision the exact same vibe and atmosphere at home." };
  }
  const pair = [a, b].sort().join("|");
  switch (pair) {
    case "calm_minimalist|structured_academic":
    case "calm_minimalist|warm_cozy_shared":
    case "structured_academic|warm_cozy_shared":
      return { score: 85, explanation: "Harmonious, peaceful home aesthetic." };
    case "creative_bustling|warm_cozy_shared":
      return { score: 84, explanation: "Both enjoy a warm, expressive shared living room." };
    case "calm_minimalist|creative_bustling":
    case "creative_bustling|structured_academic":
      return {
        score: 48,
        explanation: "Different visions for common areas (calm/structured vs bustling/creative).",
      };
    default:
      return { score: 75, explanation: "Compatible home atmosphere preferences." };
  }
}

function scoreSharedVsIndependentTime(a: string, b: string): { score: number; explanation: string } {
  const order = ["80_independent_20_shared", "50_50_balanced", "30_independent_70_shared"];
  const idxA = order.indexOf(a);
  const idxB = order.indexOf(b);
  if (idxA === -1 || idxB === -1) return { score: 75, explanation: "Balanced personal and shared time." };
  const diff = Math.abs(idxA - idxB);
  if (diff === 0) return { score: 100, explanation: "Matched balance of solo time and shared flat activities." };
  if (diff === 1) return { score: 80, explanation: "Healthy overlap between personal space and shared meals." };
  return {
    score: 40,
    explanation: "Different expectations on solo time (80% independent vs 70% shared activities).",
  };
}

// ============================================================================
// MAIN DETERMINISTIC PEACE SCORE CALCULATOR
// ============================================================================

export function calculatePeaceScore(
  userA: FullUserProfile,
  userB: FullUserProfile,
  customConfig?: Partial<PeaceScoreConfig>
): PeaceScoreResult {
  const config: PeaceScoreConfig = {
    ...DEFAULT_PEACE_SCORE_CONFIG,
    ...customConfig,
    weights: {
      ...DEFAULT_PEACE_SCORE_CONFIG.weights,
      ...(customConfig?.weights ?? {}),
    },
    importanceMultipliers: {
      ...DEFAULT_PEACE_SCORE_CONFIG.importanceMultipliers,
      ...(customConfig?.importanceMultipliers ?? {}),
    },
  };

  const impMapA = buildImportanceLookup(userA.importance);
  const impMapB = buildImportanceLookup(userB.importance);

  const dimensions: ScoredDimension[] = [];
  const dealbreakerConflicts: DealbreakerConflict[] = [];

  const totalCounts: Record<PeaceScoreCategory, number> = {
    lifestyle: 11,
    living: 5,
    personality: 6,
  };

  function addDimension(params: {
    key: string;
    label: string;
    category: PeaceScoreCategory;
    valA: string | null | undefined;
    valB: string | null | undefined;
    valALabel?: string;
    valBLabel?: string;
    scorer: (a: string, b: string) => { score: number; explanation: string; isComplementary?: boolean };
  }) {
    if (!params.valA || !params.valB) {
      // Missing answer on either profile is excluded from the denominator
      return;
    }

    const { score, explanation, isComplementary } = params.scorer(params.valA, params.valB);
    const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
    const { weight, dealbreakerTriggeredBy } = getCombinedWeight(
      params.key,
      impMapA,
      impMapB,
      config
    );

    const isDealbreakerConflict =
      dealbreakerTriggeredBy.length > 0 && clampedScore <= config.dealbreakerThresholdScore;

    if (isDealbreakerConflict) {
      dealbreakerConflicts.push({
        questionKey: params.key,
        questionLabel: params.label,
        triggeredBy: dealbreakerTriggeredBy,
        rawScore: clampedScore,
        reason: explanation,
      });
    }

    dimensions.push({
      key: params.key,
      label: params.label,
      category: params.category,
      rawScore: clampedScore,
      effectiveWeight: weight,
      userAValueLabel: params.valALabel ?? formatValueLabel(params.valA),
      userBValueLabel: params.valBLabel ?? formatValueLabel(params.valB),
      explanation,
      alignment: classifyAlignment(clampedScore, isComplementary),
      dealbreakerTriggeredBy: isDealbreakerConflict ? dealbreakerTriggeredBy : [],
    });
  }

  // --------------------------------------------------------------------------
  // 1. LIFESTYLE DIMENSIONS (11 total)
  // --------------------------------------------------------------------------
  const lifeA = userA.lifestyle;
  const lifeB = userB.lifestyle;

  addDimension({
    key: "sleep_schedule",
    label: "Sleep Schedule",
    category: "lifestyle",
    valA: lifeA?.sleep_schedule,
    valB: lifeB?.sleep_schedule,
    scorer: scoreSleepSchedule,
  });

  addDimension({
    key: "cleanliness_level",
    label: "Cleanliness & Upkeep",
    category: "lifestyle",
    valA: lifeA?.cleanliness_level,
    valB: lifeB?.cleanliness_level,
    scorer: scoreCleanliness,
  });

  addDimension({
    key: "cooking_habits",
    label: "Cooking Habits",
    category: "lifestyle",
    valA: lifeA?.cooking_habits,
    valB: lifeB?.cooking_habits,
    scorer: scoreCookingHabits,
  });

  addDimension({
    key: "dietary_preference",
    label: "Kitchen & Dietary Preference",
    category: "lifestyle",
    valA: lifeA?.dietary_preference,
    valB: lifeB?.dietary_preference,
    scorer: scoreDietaryPreference,
  });

  addDimension({
    key: "smoking_preference",
    label: "Smoking Boundaries",
    category: "lifestyle",
    valA: lifeA?.smoking_preference,
    valB: lifeB?.smoking_preference,
    scorer: scoreSmokingPreference,
  });

  addDimension({
    key: "guests_overnight",
    label: "Guests & Overnight Visitors",
    category: "lifestyle",
    valA: lifeA?.guests_overnight,
    valB: lifeB?.guests_overnight,
    scorer: scoreGuestsOvernight,
  });

  addDimension({
    key: "noise_tolerance",
    label: "Noise Tolerance",
    category: "lifestyle",
    valA: lifeA?.noise_tolerance,
    valB: lifeB?.noise_tolerance,
    scorer: scoreNoiseTolerance,
  });

  addDimension({
    key: "socialising_at_home",
    label: "Socialising at Home",
    category: "lifestyle",
    valA: lifeA?.socialising_at_home,
    valB: lifeB?.socialising_at_home,
    scorer: scoreSocialisingAtHome,
  });

  addDimension({
    key: "work_study_routine",
    label: "Work & Study Routine",
    category: "lifestyle",
    valA: lifeA?.work_study_routine,
    valB: lifeB?.work_study_routine,
    scorer: scoreWorkStudyRoutine,
  });

  addDimension({
    key: "pet_preference",
    label: "Pets at Home",
    category: "lifestyle",
    valA: lifeA?.pet_preference,
    valB: lifeB?.pet_preference,
    scorer: scorePetPreference,
  });

  addDimension({
    key: "chore_arrangement",
    label: "Household Chores",
    category: "lifestyle",
    valA: lifeA?.chore_arrangement,
    valB: lifeB?.chore_arrangement,
    scorer: scoreChoreArrangement,
  });

  // --------------------------------------------------------------------------
  // 2. LIVING PREFERENCES DIMENSIONS (5 total)
  // --------------------------------------------------------------------------
  const livA = userA.living;
  const livB = userB.living;

  if (
    livA?.budget_min_inr != null &&
    livA?.budget_max_inr != null &&
    livB?.budget_min_inr != null &&
    livB?.budget_max_inr != null
  ) {
    addDimension({
      key: "budget_range",
      label: "Monthly Budget Compatibility",
      category: "living",
      valA: `${livA.budget_min_inr}-${livA.budget_max_inr}`,
      valB: `${livB.budget_min_inr}-${livB.budget_max_inr}`,
      valALabel: `₹${livA.budget_min_inr.toLocaleString("en-IN")} – ₹${livA.budget_max_inr.toLocaleString("en-IN")}/mo`,
      valBLabel: `₹${livB.budget_min_inr.toLocaleString("en-IN")} – ₹${livB.budget_max_inr.toLocaleString("en-IN")}/mo`,
      scorer: () =>
        scoreBudgetOverlap(
          livA.budget_min_inr!,
          livA.budget_max_inr!,
          livB.budget_min_inr!,
          livB.budget_max_inr!
        ),
    });
  }

  if (
    livA?.preferred_areas &&
    livA.preferred_areas.length > 0 &&
    livB?.preferred_areas &&
    livB.preferred_areas.length > 0
  ) {
    addDimension({
      key: "preferred_areas",
      label: "Preferred Neighbourhoods",
      category: "living",
      valA: livA.preferred_areas.join(", "),
      valB: livB.preferred_areas.join(", "),
      valALabel: livA.preferred_areas.slice(0, 3).join(", "),
      valBLabel: livB.preferred_areas.slice(0, 3).join(", "),
      scorer: () =>
        scorePreferredAreas(
          userA.profile.city,
          userB.profile.city,
          livA.preferred_areas,
          livB.preferred_areas
        ),
    });
  }

  addDimension({
    key: "moving_timeline",
    label: "Moving Timeline",
    category: "living",
    valA: livA?.moving_timeline,
    valB: livB?.moving_timeline,
    scorer: scoreMovingTimeline,
  });

  addDimension({
    key: "living_arrangement",
    label: "Flat Setup & Room Type",
    category: "living",
    valA: livA?.living_arrangement,
    valB: livB?.living_arrangement,
    scorer: scoreLivingArrangement,
  });

  addDimension({
    key: "search_intent",
    label: "Flatshare Search Intent",
    category: "living",
    valA: userA.profile.search_intent,
    valB: userB.profile.search_intent,
    scorer: scoreSearchIntent,
  });

  // --------------------------------------------------------------------------
  // 3. PERSONALITY & COMMUNICATION DIMENSIONS (6 total)
  // --------------------------------------------------------------------------
  const persA = userA.personality;
  const persB = userB.personality;

  addDimension({
    key: "social_interaction_level",
    label: "Social Interaction at Home",
    category: "personality",
    valA: persA?.social_interaction_level,
    valB: persB?.social_interaction_level,
    scorer: scoreSocialInteraction,
  });

  addDimension({
    key: "energy_orientation",
    label: "Social Battery & Recharge Style",
    category: "personality",
    valA: persA?.energy_orientation,
    valB: persB?.energy_orientation,
    scorer: scoreEnergyOrientation,
  });

  addDimension({
    key: "communication_style",
    label: "Communication Style",
    category: "personality",
    valA: persA?.communication_style,
    valB: persB?.communication_style,
    scorer: scoreCommunicationStyle,
  });

  addDimension({
    key: "conflict_resolution",
    label: "Conflict Resolution Approach",
    category: "personality",
    valA: persA?.conflict_resolution,
    valB: persB?.conflict_resolution,
    scorer: scoreConflictResolution,
  });

  addDimension({
    key: "home_atmosphere",
    label: "Preferred Home Atmosphere",
    category: "personality",
    valA: persA?.home_atmosphere,
    valB: persB?.home_atmosphere,
    scorer: scoreHomeAtmosphere,
  });

  addDimension({
    key: "shared_vs_independent_time",
    label: "Independent vs Shared Time",
    category: "personality",
    valA: persA?.shared_vs_independent_time,
    valB: persB?.shared_vs_independent_time,
    scorer: scoreSharedVsIndependentTime,
  });

  // --------------------------------------------------------------------------
  // 4. CATEGORY AGGREGATION (EXCLUDING MISSING ANSWERS FROM DENOMINATOR)
  // --------------------------------------------------------------------------
  function computeCategoryScore(cat: PeaceScoreCategory): {
    score: number | null;
    answeredCount: number;
  } {
    const items = dimensions.filter((d) => d.category === cat);
    if (items.length === 0) {
      return { score: null, answeredCount: 0 };
    }
    let weightedSum = 0;
    let totalWeight = 0;
    for (const item of items) {
      weightedSum += item.rawScore * item.effectiveWeight;
      totalWeight += item.effectiveWeight;
    }
    const avg = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
    return { score: avg, answeredCount: items.length };
  }

  const lifeStats = computeCategoryScore("lifestyle");
  const livStats = computeCategoryScore("living");
  const persStats = computeCategoryScore("personality");

  const activeWeightSum =
    (lifeStats.score !== null ? config.weights.lifestyle : 0) +
    (livStats.score !== null ? config.weights.living : 0) +
    (persStats.score !== null ? config.weights.personality : 0);

  const activeLifestyleWeight =
    lifeStats.score !== null && activeWeightSum > 0
      ? config.weights.lifestyle / activeWeightSum
      : 0;
  const activeLivingWeight =
    livStats.score !== null && activeWeightSum > 0
      ? config.weights.living / activeWeightSum
      : 0;
  const activePersonalityWeight =
    persStats.score !== null && activeWeightSum > 0
      ? config.weights.personality / activeWeightSum
      : 0;

  const totalQuestionsCount =
    totalCounts.lifestyle + totalCounts.living + totalCounts.personality;
  const answeredQuestionsCount = dimensions.length;
  const completenessPercentage = Math.round(
    (answeredQuestionsCount / totalQuestionsCount) * 100
  );

  const completenessLabel: PeaceScoreResult["completenessLabel"] =
    answeredQuestionsCount < config.minAnsweredQuestionsForScore
      ? "Insufficient Data"
      : completenessPercentage >= 75
        ? "High Completeness"
        : "Moderate Completeness";

  const categories = {
    lifestyle: {
      category: "lifestyle" as const,
      label: "Lifestyle & Daily Habits",
      configuredWeight: config.weights.lifestyle,
      activeWeight: Number(activeLifestyleWeight.toFixed(4)),
      score: lifeStats.score,
      answeredCount: lifeStats.answeredCount,
      totalCount: totalCounts.lifestyle,
    },
    living: {
      category: "living" as const,
      label: "Living Preferences & Budget",
      configuredWeight: config.weights.living,
      activeWeight: Number(activeLivingWeight.toFixed(4)),
      score: livStats.score,
      answeredCount: livStats.answeredCount,
      totalCount: totalCounts.living,
    },
    personality: {
      category: "personality" as const,
      label: "Personality & Communication",
      configuredWeight: config.weights.personality,
      activeWeight: Number(activePersonalityWeight.toFixed(4)),
      score: persStats.score,
      answeredCount: persStats.answeredCount,
      totalCount: totalCounts.personality,
    },
  };

  // Similarities (highest alignment) & Differences (lowest alignment requiring discussion)
  const sortedByScoreDesc = [...dimensions].sort((a, b) => b.rawScore - a.rawScore);
  const similarities = sortedByScoreDesc.filter((d) => d.rawScore >= 75).slice(0, 5);
  const differences = [...dimensions]
    .sort((a, b) => a.rawScore - b.rawScore)
    .filter((d) => d.rawScore < 75)
    .slice(0, 4);

  // If insufficient mutually answered questions, return honest incomplete_data state
  if (
    answeredQuestionsCount < config.minAnsweredQuestionsForScore ||
    activeWeightSum === 0
  ) {
    return {
      status: "incomplete_data",
      overallScore: null,
      unpenalisedScore: null,
      hasDealbreakerConflict: dealbreakerConflicts.length > 0,
      dealbreakerConflicts,
      completenessPercentage,
      answeredQuestionsCount,
      totalQuestionsCount,
      completenessLabel,
      categories,
      dimensions,
      similarities,
      differences,
      disclaimer: DISCLAIMER_TEXT,
    };
  }

  const rawWeightedOverall =
    (lifeStats.score ?? 0) * activeLifestyleWeight +
    (livStats.score ?? 0) * activeLivingWeight +
    (persStats.score ?? 0) * activePersonalityWeight;

  const unpenalisedScore = Math.max(0, Math.min(100, Math.round(rawWeightedOverall)));
  const hasDealbreakerConflict = dealbreakerConflicts.length > 0;

  // Apply explicit, transparent deal-breaker cap when a designated deal-breaker is violated
  const overallScore = hasDealbreakerConflict
    ? Math.min(unpenalisedScore, config.dealbreakerCapScore)
    : unpenalisedScore;

  const status: PeaceScoreResult["status"] =
    completenessPercentage >= 75 ? "complete" : "partial_data";

  return {
    status,
    overallScore,
    unpenalisedScore,
    hasDealbreakerConflict,
    dealbreakerConflicts,
    completenessPercentage,
    answeredQuestionsCount,
    totalQuestionsCount,
    completenessLabel,
    categories,
    dimensions,
    similarities,
    differences,
    disclaimer: DISCLAIMER_TEXT,
  };
}
