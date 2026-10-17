import React from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import type { FullUserProfile, ProfileRow } from "@/types/database";

export const metadata = {
  title: "Onboarding — Build Your Compatibility Profile",
};

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?redirectTo=/onboarding&reason=auth_required");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/onboarding");
  }

  const [
    { data: profile },
    { data: lifestyle },
    { data: personality },
    { data: living },
    { data: importance },
    { data: privacy },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("lifestyle_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("personality_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("living_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("preference_importance").select("*").eq("user_id", user.id),
    supabase.from("privacy_preferences").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const defaultProfile: ProfileRow = profile ?? {
    id: user.id,
    first_name: user.user_metadata?.first_name || "",
    age_confirmed_18_plus: Boolean(user.user_metadata?.age_confirmed_18_plus),
    birth_year: null,
    avatar_url: null,
    bio: "",
    occupation_title: "",
    occupation_category: "working_professional",
    institution_or_company: "",
    city: "Bangalore",
    search_intent: "looking_for_flatmate",
    onboarding_step: 1,
    onboarding_completed: false,
    is_published: false,
    is_email_verified: Boolean(user.email_confirmed_at),
    account_status: "active",
    is_admin: false,
    last_active_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const fullData: FullUserProfile = {
    profile: defaultProfile,
    lifestyle: lifestyle ?? null,
    personality: personality ?? null,
    living: living ?? null,
    importance: importance ?? [],
    privacy: privacy ?? null,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <OnboardingWizard userId={user.id} initialData={fullData} />
    </div>
  );
}
