import { calculatePeaceScore, type PeaceScoreResult } from "@/lib/peace-score";
import type { FullUserProfile } from "@/types/database";

export interface DiscoveryFilterParams {
  city?: string;
  area?: string;
  maxBudgetInr?: number;
  minBudgetInr?: number;
  movingTimeline?: string;
  sleepSchedule?: string;
  cleanlinessLevel?: string;
  smokingPreference?: string;
  // Premium-only advanced filters
  dietaryPreference?: string;
  petPreference?: string;
  workStudyRoutine?: string;
  guestsOvernight?: string;
  // Sorting & Pagination
  sortBy?: "peace_score" | "recent";
  page?: number;
  pageSize?: number;
}

export interface EnrichedDiscoveryCandidate {
  candidate: FullUserProfile;
  peaceScore: PeaceScoreResult;
  isCandidatePremium?: boolean;
  existingInterestStatus?: string | null;
}

export interface PaginatedDiscoveryResult {
  items: EnrichedDiscoveryCandidate[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Pure, deterministic server-side filtering, Peace Score calculation, sorting,
 * and pagination pipeline for SpaceSync Discovery.
 * Never mutates inputs or fabricates profiles.
 */
export function filterAndRankDiscoveryCandidates(params: {
  candidates: (FullUserProfile & { isCandidatePremium?: boolean; existingInterestStatus?: string | null })[];
  viewerProfile: FullUserProfile | null;
  viewerUserId: string | null;
  blockedUserIds: Set<string>;
  isPremiumViewer: boolean;
  filters: DiscoveryFilterParams;
}): PaginatedDiscoveryResult {
  const {
    candidates,
    viewerProfile,
    viewerUserId,
    blockedUserIds,
    isPremiumViewer,
    filters,
  } = params;

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, Math.min(24, filters.pageSize ?? 9));

  const eligible: EnrichedDiscoveryCandidate[] = [];

  for (const item of candidates) {
    const p = item.profile;

    // 1. Mandatory Security & Eligibility Exclusions
    if (viewerUserId && p.id === viewerUserId) continue;
    if (!p.is_published) continue;
    if (!p.onboarding_completed) continue;
    if (!p.age_confirmed_18_plus) continue;
    if (p.account_status !== "active") continue;
    if (item.privacy && item.privacy.discoverable_in_search === false) continue;
    if (blockedUserIds.has(p.id)) continue;

    // 2. City Filter
    if (filters.city && filters.city !== "all") {
      if (p.city.trim().toLowerCase() !== filters.city.trim().toLowerCase()) {
        continue;
      }
    }

    // 3. Preferred Area Filter
    if (filters.area && filters.area.trim().length > 0) {
      const targetArea = filters.area.trim().toLowerCase();
      const candidateAreas = (item.living?.preferred_areas ?? []).map((a) =>
        a.trim().toLowerCase()
      );
      if (!candidateAreas.some((a) => a.includes(targetArea))) {
        continue;
      }
    }

    // 4. Budget Compatibility Filter
    if (filters.maxBudgetInr != null && !Number.isNaN(filters.maxBudgetInr)) {
      const candMin = item.living?.budget_min_inr;
      if (candMin != null && candMin > filters.maxBudgetInr) {
        continue;
      }
    }
    if (filters.minBudgetInr != null && !Number.isNaN(filters.minBudgetInr)) {
      const candMax = item.living?.budget_max_inr;
      if (candMax != null && candMax < filters.minBudgetInr) {
        continue;
      }
    }

    // 5. Moving Timeline Filter
    if (filters.movingTimeline && filters.movingTimeline !== "all") {
      if (item.living?.moving_timeline !== filters.movingTimeline) {
        continue;
      }
    }

    // 6. Basic Lifestyle Filters
    if (filters.sleepSchedule && filters.sleepSchedule !== "all") {
      if (item.lifestyle?.sleep_schedule !== filters.sleepSchedule) {
        continue;
      }
    }
    if (filters.cleanlinessLevel && filters.cleanlinessLevel !== "all") {
      if (item.lifestyle?.cleanliness_level !== filters.cleanlinessLevel) {
        continue;
      }
    }
    if (filters.smokingPreference && filters.smokingPreference !== "all") {
      if (item.lifestyle?.smoking_preference !== filters.smokingPreference) {
        continue;
      }
    }

    // 7. Premium Advanced Filters (Enforced Server-Side: only active if viewer has Premium)
    if (isPremiumViewer) {
      if (filters.dietaryPreference && filters.dietaryPreference !== "all") {
        if (item.lifestyle?.dietary_preference !== filters.dietaryPreference) {
          continue;
        }
      }
      if (filters.petPreference && filters.petPreference !== "all") {
        if (item.lifestyle?.pet_preference !== filters.petPreference) {
          continue;
        }
      }
      if (filters.workStudyRoutine && filters.workStudyRoutine !== "all") {
        if (item.lifestyle?.work_study_routine !== filters.workStudyRoutine) {
          continue;
        }
      }
      if (filters.guestsOvernight && filters.guestsOvernight !== "all") {
        if (item.lifestyle?.guests_overnight !== filters.guestsOvernight) {
          continue;
        }
      }
    }

    // 8. Calculate Deterministic Peace Score
    const peaceScore = viewerProfile
      ? calculatePeaceScore(viewerProfile, item)
      : calculatePeaceScore(
          {
            profile: p,
            lifestyle: null,
            personality: null,
            living: null,
            importance: [],
          },
          item
        );

    eligible.push({
      candidate: item,
      peaceScore,
      isCandidatePremium: Boolean(item.isCandidatePremium),
      existingInterestStatus: item.existingInterestStatus ?? null,
    });
  }

  // 9. Deterministic Sorting
  const sortBy = filters.sortBy ?? "peace_score";
  eligible.sort((a, b) => {
    if (sortBy === "peace_score") {
      const scoreA = a.peaceScore.overallScore ?? -1;
      const scoreB = b.peaceScore.overallScore ?? -1;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      // Priority visibility tie-breaker for Premium profiles
      if (Boolean(b.isCandidatePremium) !== Boolean(a.isCandidatePremium)) {
        return b.isCandidatePremium ? 1 : -1;
      }
    } else {
      // Sort by recent activity, with Priority Visibility first
      if (Boolean(b.isCandidatePremium) !== Boolean(a.isCandidatePremium)) {
        return b.isCandidatePremium ? 1 : -1;
      }
    }
    return (
      new Date(b.candidate.profile.updated_at).getTime() -
      new Date(a.candidate.profile.updated_at).getTime()
    );
  });

  // 10. Server-Side Pagination
  const totalCount = eligible.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedItems = eligible.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    totalCount,
    page: safePage,
    pageSize,
    totalPages,
  };
}
