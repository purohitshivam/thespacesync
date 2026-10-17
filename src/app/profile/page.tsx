import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatValueLabel } from "@/lib/peace-score";
import { formatInr, getInitials } from "@/lib/utils";
import { ProfilePublishToggle } from "@/components/profile/ProfilePublishToggle";
import { Edit3, MapPin, ShieldCheck, Briefcase, Eye, Lock } from "lucide-react";

export const metadata = {
  title: "My Compatibility Profile",
};

export default async function MyProfilePage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?redirectTo=/profile&reason=auth_required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  const [
    { data: profile },
    { data: lifestyle },
    { data: personality },
    { data: living },
    { data: importance },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("lifestyle_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("personality_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("living_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("preference_importance").select("*").eq("user_id", user.id),
  ]);

  const canPublish = Boolean(
    profile?.first_name?.trim() &&
      profile?.city?.trim() &&
      profile?.age_confirmed_18_plus
  );

  const dealbreakers = (importance ?? []).filter((i) => i.is_dealbreaker);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Profile Summary Card */}
      <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.first_name || "Profile"}
              className="w-20 h-20 rounded-3xl object-cover border border-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-sand flex items-center justify-center font-serif text-2xl font-semibold text-forest shrink-0">
              {getInitials(profile?.first_name)}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl text-charcoal">
                {profile?.first_name || "Your Profile"}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold ${
                  profile?.is_published
                    ? "bg-forest/15 text-forest"
                    : "bg-sand text-charcoal"
                }`}
              >
                {profile?.is_published ? (
                  <>
                    <Eye className="w-3 h-3" /> Published
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-terracotta" /> Unpublished Draft
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-terracotta" />
                {profile?.city || "City not set"}
              </span>
              {(profile?.occupation_title || profile?.occupation_category) && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-forest" />
                  {profile?.occupation_title || formatValueLabel(profile?.occupation_category)}
                  {profile?.institution_or_company ? ` · ${profile.institution_or_company}` : ""}
                </span>
              )}
            </div>

            {profile?.bio && (
              <p className="text-sm text-charcoal max-w-2xl pt-1 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-ivory hover:bg-sand text-xs font-semibold text-charcoal transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-forest" />
            Edit Onboarding Answers
          </Link>
          <ProfilePublishToggle
            isPublished={Boolean(profile?.is_published)}
            canPublish={canPublish}
          />
        </div>
      </div>

      {/* Living & Budget Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-3xl p-6 md:p-7 shadow-warm space-y-4">
          <h2 className="font-serif text-xl text-charcoal">Living Preferences & Budget</h2>
          <dl className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-border/70">
              <dt className="text-muted">Monthly Budget Range</dt>
              <dd className="font-semibold text-charcoal">
                {formatInr(living?.budget_min_inr)} – {formatInr(living?.budget_max_inr)} / mo
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-border/70">
              <dt className="text-muted">Moving Timeline</dt>
              <dd className="font-semibold text-charcoal">
                {formatValueLabel(living?.moving_timeline)}
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-border/70">
              <dt className="text-muted">Preferred Arrangement</dt>
              <dd className="font-semibold text-charcoal">
                {formatValueLabel(living?.living_arrangement)}
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-border/70">
              <dt className="text-muted">Search Intent</dt>
              <dd className="font-semibold text-charcoal">
                {formatValueLabel(profile?.search_intent)}
              </dd>
            </div>
            <div className="pt-1">
              <dt className="text-muted mb-1.5">Preferred Neighbourhoods</dt>
              <dd className="flex flex-wrap gap-1.5">
                {living?.preferred_areas && living.preferred_areas.length > 0 ? (
                  living.preferred_areas.map((a: string) => (
                    <span
                      key={a}
                      className="px-2.5 py-1 rounded-full bg-sand text-charcoal font-medium"
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">No specific areas selected yet</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 md:p-7 shadow-warm space-y-4">
          <h2 className="font-serif text-xl text-charcoal">Boundaries & Deal-Breakers</h2>
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-semibold text-charcoal mb-1.5">Designated Peace Score Deal-Breakers</h3>
              {dealbreakers.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {dealbreakers.map((d) => (
                    <span
                      key={d.question_key}
                      className="px-2.5 py-1 rounded-full bg-terracotta/15 text-terracotta-dark font-medium"
                    >
                      {d.question_key.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No strict deal-breakers flagged.</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-charcoal mb-1.5">Household Boundaries</h3>
              {living?.household_boundaries && living.household_boundaries.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {living.household_boundaries.map((b: string) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 rounded-full bg-ivory border border-border text-charcoal"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted">None specified yet.</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-charcoal mb-1.5">Non-Negotiables</h3>
              {living?.non_negotiables && living.non_negotiables.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {living.non_negotiables.map((n: string) => (
                    <span
                      key={n}
                      className="px-2.5 py-1 rounded-full bg-sand text-forest font-medium"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted">None specified yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle & Personality Grid */}
      <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-charcoal">
            Lifestyle, Habits & Communication Answers
          </h2>
          <Link href="/onboarding" className="text-xs font-semibold text-forest underline">
            Update Answers
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { label: "Sleep Schedule", val: lifestyle?.sleep_schedule },
            { label: "Cleanliness", val: lifestyle?.cleanliness_level },
            { label: "Cooking Habits", val: lifestyle?.cooking_habits },
            { label: "Dietary Kitchen Rule", val: lifestyle?.dietary_preference },
            { label: "Smoking", val: lifestyle?.smoking_preference },
            { label: "Overnight Guests", val: lifestyle?.guests_overnight },
            { label: "Noise Tolerance", val: lifestyle?.noise_tolerance },
            { label: "Socialising at Home", val: lifestyle?.socialising_at_home },
            { label: "Work / Study Routine", val: lifestyle?.work_study_routine },
            { label: "Pets", val: lifestyle?.pet_preference },
            { label: "Household Chores", val: lifestyle?.chore_arrangement },
            { label: "Social Interaction", val: personality?.social_interaction_level },
            { label: "Recharge Style", val: personality?.energy_orientation },
            { label: "Communication Style", val: personality?.communication_style },
            { label: "Conflict Resolution", val: personality?.conflict_resolution },
            { label: "Home Atmosphere", val: personality?.home_atmosphere },
            { label: "Independent vs Shared Time", val: personality?.shared_vs_independent_time },
          ].map((item) => (
            <div key={item.label} className="p-3.5 rounded-2xl bg-ivory border border-border">
              <span className="block text-[10px] uppercase tracking-wider text-muted mb-0.5">
                {item.label}
              </span>
              <span className="font-medium text-charcoal">{formatValueLabel(item.val)}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border flex items-center gap-2 text-xs text-muted">
          <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
          <span>
            Your email address and private contact details are never shown on your public profile card. Manage visibility anytime in{" "}
            <Link href="/settings" className="text-forest underline">
              Settings & Privacy
            </Link>
            .
          </span>
        </div>
      </div>
    </div>
  );
}
