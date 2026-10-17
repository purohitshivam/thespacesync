import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculatePeaceScore, formatValueLabel } from "@/lib/peace-score";
import { evaluateSubscriptionEntitlements } from "@/lib/entitlements";
import { formatInr, getInitials } from "@/lib/utils";
import { PeaceScoreBreakdownCard } from "@/components/ui/PeaceScoreBadge";
import { ProfileActionsBar } from "@/components/discovery/ProfileActionsBar";
import type { FullUserProfile } from "@/types/database";
import { ArrowLeft, MapPin, Briefcase, Sparkles, Lock } from "lucide-react";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(`/login?redirectTo=/discover/${id}&reason=auth_required`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/discover/${id}`);
  }

  if (user.id === id) {
    redirect("/profile");
  }

  // Check if blocked in either direction
  const { data: blockCheck } = await supabase
    .from("user_blocks")
    .select("id")
    .or(
      `and(blocker_id.eq.${user.id},blocked_id.eq.${id}),and(blocker_id.eq.${id},blocked_id.eq.${user.id})`
    )
    .maybeSingle();

  if (blockCheck) {
    notFound();
  }

  // Fetch target profile and verify eligibility
  const [
    { data: targetProfile },
    { data: targetLifestyle },
    { data: targetPersonality },
    { data: targetLiving },
    { data: targetImportance },
    { data: targetPrivacy },
    { data: viewerProfile },
    { data: viewerLifestyle },
    { data: viewerPersonality },
    { data: viewerLiving },
    { data: viewerImportance },
    { data: viewerSub },
    { data: existingInterest },
    { data: existingConv },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .eq("onboarding_completed", true)
      .eq("age_confirmed_18_plus", true)
      .eq("account_status", "active")
      .maybeSingle(),
    supabase.from("lifestyle_preferences").select("*").eq("user_id", id).maybeSingle(),
    supabase.from("personality_preferences").select("*").eq("user_id", id).maybeSingle(),
    supabase.from("living_preferences").select("*").eq("user_id", id).maybeSingle(),
    supabase.from("preference_importance").select("*").eq("user_id", id),
    supabase.from("privacy_preferences").select("*").eq("user_id", id).maybeSingle(),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("lifestyle_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("personality_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("living_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("preference_importance").select("*").eq("user_id", user.id),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("interests")
      .select("status")
      .eq("sender_id", user.id)
      .eq("receiver_id", id)
      .maybeSingle(),
    supabase
      .from("conversations")
      .select("id")
      .eq("user_one_id", user.id < id ? user.id : id)
      .eq("user_two_id", user.id < id ? id : user.id)
      .maybeSingle(),
  ]);

  if (!targetProfile) {
    notFound();
  }

  const viewerFull: FullUserProfile = {
    profile: viewerProfile ?? targetProfile,
    lifestyle: viewerLifestyle ?? null,
    personality: viewerPersonality ?? null,
    living: viewerLiving ?? null,
    importance: viewerImportance ?? [],
  };

  const targetFull: FullUserProfile = {
    profile: targetProfile,
    lifestyle: targetLifestyle ?? null,
    personality: targetPersonality ?? null,
    living: targetLiving ?? null,
    importance: targetImportance ?? [],
  };

  const peaceScore = calculatePeaceScore(viewerFull, targetFull);
  const entitlements = evaluateSubscriptionEntitlements(viewerSub);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link
        href="/discover"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-charcoal"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Discovery
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-sand flex items-center justify-center font-serif text-2xl font-semibold text-forest shrink-0">
              {getInitials(targetProfile.first_name)}
            </div>
            <div>
              <h1 className="font-serif text-3xl text-charcoal">
                {targetProfile.first_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-terracotta" />
                  {targetProfile.city}
                </span>
                {(targetProfile.occupation_title || targetProfile.occupation_category) && (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-forest" />
                    {targetProfile.occupation_title ||
                      formatValueLabel(targetProfile.occupation_category)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-left md:text-right text-xs text-muted space-y-1">
            <div>
              Monthly Budget:{" "}
              <strong className="text-charcoal">
                {formatInr(targetLiving?.budget_min_inr)} –{" "}
                {formatInr(targetLiving?.budget_max_inr)}
              </strong>
            </div>
            <div>
              Moving Timeline:{" "}
              <strong className="text-charcoal">
                {formatValueLabel(targetLiving?.moving_timeline)}
              </strong>
            </div>
            <div>
              Intent:{" "}
              <strong className="text-charcoal">
                {formatValueLabel(targetProfile.search_intent)}
              </strong>
            </div>
          </div>
        </div>

        {targetProfile.bio && (
          <p className="text-sm text-charcoal leading-relaxed pt-2 border-t border-border">
            {targetProfile.bio}
          </p>
        )}

        {/* Shared contact detail ONLY if active match & target opted in */}
        {targetPrivacy?.share_contact_with_matches &&
          targetPrivacy?.contact_phone_or_handle && (
            <div className="p-3.5 rounded-2xl bg-forest/10 border border-forest/30 text-xs text-forest">
              <strong>Shared Match Contact:</strong> {targetPrivacy.contact_phone_or_handle}
            </div>
          )}

        <div className="pt-4 border-t border-border">
          <ProfileActionsBar
            targetUserId={targetProfile.id}
            targetName={targetProfile.first_name}
            peaceScore={peaceScore.overallScore}
            initialInterestStatus={existingInterest?.status ?? null}
            conversationId={existingConv?.id ?? null}
          />
        </div>
      </div>

      {/* Explainable Peace Score Breakdown */}
      <PeaceScoreBreakdownCard
        result={peaceScore}
        isPremiumViewer={entitlements.isPremium}
      />

      {!entitlements.isPremium && (
        <div className="p-5 rounded-3xl bg-sand/70 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-forest">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              <span>Want side-by-side answer comparisons for every question?</span>
            </div>
            <p className="text-xs text-muted">
              SpaceSync Premium (₹199/month) unlocks side-by-side answer comparisons and advanced lifestyle filters.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-forest text-ivory text-xs font-semibold shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            View Premium
          </Link>
        </div>
      )}
    </div>
  );
}
