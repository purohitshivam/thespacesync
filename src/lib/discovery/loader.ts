import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfigStatus } from "@/lib/env";
import { evaluateSubscriptionEntitlements } from "@/lib/entitlements";
import {
  filterAndRankDiscoveryCandidates,
  type DiscoveryFilterParams,
  type PaginatedDiscoveryResult,
} from "@/lib/discovery/filter";
import type {
  FullUserProfile,
  LifestylePreferencesRow,
  LivingPreferencesRow,
  PersonalityPreferencesRow,
  PreferenceImportanceRow,
  PrivacyPreferencesRow,
  ProfileRow,
} from "@/types/database";

export interface DiscoveryDashboardData {
  isSupabaseConfigured: boolean;
  missingSupabaseVars: string[];
  isAuthenticated: boolean;
  viewerUserId: string | null;
  viewerProfilePublished: boolean;
  isPremiumViewer: boolean;
  results: PaginatedDiscoveryResult;
}

export async function loadDiscoveryDashboardData(
  filters: DiscoveryFilterParams
): Promise<DiscoveryDashboardData> {
  const config = getSupabaseConfigStatus();
  const emptyResults: PaginatedDiscoveryResult = {
    items: [],
    totalCount: 0,
    page: Math.max(1, filters.page ?? 1),
    pageSize: filters.pageSize ?? 9,
    totalPages: 1,
  };

  if (!config.isConfigured) {
    return {
      isSupabaseConfigured: false,
      missingSupabaseVars: config.missingVars,
      isAuthenticated: false,
      viewerUserId: null,
      viewerProfilePublished: false,
      isPremiumViewer: false,
      results: emptyResults,
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      isSupabaseConfigured: false,
      missingSupabaseVars: config.missingVars,
      isAuthenticated: false,
      viewerUserId: null,
      viewerProfilePublished: false,
      isPremiumViewer: false,
      results: emptyResults,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Unauthenticated viewers never receive unpublished or private user records
    return {
      isSupabaseConfigured: true,
      missingSupabaseVars: [],
      isAuthenticated: false,
      viewerUserId: null,
      viewerProfilePublished: false,
      isPremiumViewer: false,
      results: emptyResults,
    };
  }

  // Load viewer's own profile, preferences, subscription, blocks, and existing interests
  const [
    { data: viewerProfRow },
    { data: viewerLifeRow },
    { data: viewerPersRow },
    { data: viewerLivRow },
    { data: viewerImpRows },
    { data: viewerSubRow },
    { data: blockRows },
    { data: interestRows },
    { data: candidateProfileRows },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("lifestyle_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("personality_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("living_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("preference_importance").select("*").eq("user_id", user.id),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("user_blocks")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
    supabase
      .from("interests")
      .select("receiver_id, status")
      .eq("sender_id", user.id),
    supabase
      .from("profiles")
      .select("*")
      .eq("is_published", true)
      .eq("onboarding_completed", true)
      .eq("age_confirmed_18_plus", true)
      .eq("account_status", "active")
      .neq("id", user.id),
  ]);

  const entitlements = evaluateSubscriptionEntitlements(viewerSubRow);

  const blockedUserIds = new Set<string>();
  for (const b of blockRows ?? []) {
    if (b.blocker_id === user.id) blockedUserIds.add(b.blocked_id);
    if (b.blocked_id === user.id) blockedUserIds.add(b.blocker_id);
  }

  const interestStatusByReceiver = new Map<string, string>();
  for (const i of interestRows ?? []) {
    interestStatusByReceiver.set(i.receiver_id, i.status);
  }

  const viewerFullProfile: FullUserProfile | null = viewerProfRow
    ? {
        profile: viewerProfRow as ProfileRow,
        lifestyle: (viewerLifeRow as LifestylePreferencesRow) ?? null,
        personality: (viewerPersRow as PersonalityPreferencesRow) ?? null,
        living: (viewerLivRow as LivingPreferencesRow) ?? null,
        importance: (viewerImpRows as PreferenceImportanceRow[]) ?? [],
      }
    : null;

  const candidateIds = (candidateProfileRows ?? []).map((r) => r.id);

  if (candidateIds.length === 0) {
    return {
      isSupabaseConfigured: true,
      missingSupabaseVars: [],
      isAuthenticated: true,
      viewerUserId: user.id,
      viewerProfilePublished: Boolean(viewerProfRow?.is_published),
      isPremiumViewer: entitlements.isPremium,
      results: emptyResults,
    };
  }

  const [
    { data: lifeList },
    { data: persList },
    { data: livList },
    { data: impList },
    { data: privList },
    { data: subList },
  ] = await Promise.all([
    supabase.from("lifestyle_preferences").select("*").in("user_id", candidateIds),
    supabase.from("personality_preferences").select("*").in("user_id", candidateIds),
    supabase.from("living_preferences").select("*").in("user_id", candidateIds),
    supabase.from("preference_importance").select("*").in("user_id", candidateIds),
    supabase.from("privacy_preferences").select("user_id, discoverable_in_search, show_institution_or_company, show_exact_neighborhoods").in("user_id", candidateIds),
    supabase.from("subscriptions").select("user_id, tier, status, current_period_end").in("user_id", candidateIds),
  ]);

  const lifeMap = new Map<string, LifestylePreferencesRow>();
  for (const r of lifeList ?? []) lifeMap.set(r.user_id, r as LifestylePreferencesRow);

  const persMap = new Map<string, PersonalityPreferencesRow>();
  for (const r of persList ?? []) persMap.set(r.user_id, r as PersonalityPreferencesRow);

  const livMap = new Map<string, LivingPreferencesRow>();
  for (const r of livList ?? []) livMap.set(r.user_id, r as LivingPreferencesRow);

  const impMap = new Map<string, PreferenceImportanceRow[]>();
  for (const r of impList ?? []) {
    const arr = impMap.get(r.user_id) ?? [];
    arr.push(r as PreferenceImportanceRow);
    impMap.set(r.user_id, arr);
  }

  const privMap = new Map<string, PrivacyPreferencesRow>();
  for (const r of privList ?? []) privMap.set(r.user_id, r as PrivacyPreferencesRow);

  const premiumCandidateIds = new Set<string>();
  for (const s of subList ?? []) {
    if (s.tier === "premium" && s.status === "active") {
      premiumCandidateIds.add(s.user_id);
    }
  }

  const candidates = (candidateProfileRows ?? []).map((row) => ({
    profile: row as ProfileRow,
    lifestyle: lifeMap.get(row.id) ?? null,
    personality: persMap.get(row.id) ?? null,
    living: livMap.get(row.id) ?? null,
    importance: impMap.get(row.id) ?? [],
    privacy: privMap.get(row.id) ?? null,
    isCandidatePremium: premiumCandidateIds.has(row.id),
    existingInterestStatus: interestStatusByReceiver.get(row.id) ?? null,
  }));

  const results = filterAndRankDiscoveryCandidates({
    candidates,
    viewerProfile: viewerFullProfile,
    viewerUserId: user.id,
    blockedUserIds,
    isPremiumViewer: entitlements.isPremium,
    filters,
  });

  return {
    isSupabaseConfigured: true,
    missingSupabaseVars: [],
    isAuthenticated: true,
    viewerUserId: user.id,
    viewerProfilePublished: Boolean(viewerProfRow?.is_published),
    isPremiumViewer: entitlements.isPremium,
    results,
  };
}
