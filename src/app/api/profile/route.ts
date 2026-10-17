import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  basicInfoSchema,
  lifestylePreferencesSchema,
  personalityPreferencesSchema,
  livingPreferencesSchema,
  preferenceImportanceArraySchema,
  privacyPreferencesSchema,
} from "@/lib/validations";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase database is not configured in this environment." },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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

  return NextResponse.json({
    profile,
    lifestyle,
    personality,
    living,
    importance: importance ?? [],
    privacy,
  });
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase database is not configured in this environment." },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const rl = checkRateLimit({
    key: `profile_update:${user.id}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  // Check if user account is suspended
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile && existingProfile.account_status !== "active") {
    return NextResponse.json(
      { error: "Your account is currently suspended and cannot modify or publish a profile." },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // 1. Validate & Upsert Basic Profile Info if provided
  if (body.basicInfo) {
    const parsedBasic = basicInfoSchema.safeParse(body.basicInfo);
    if (!parsedBasic.success) {
      return NextResponse.json(
        { error: parsedBasic.error.issues[0]?.message || "Invalid basic profile information" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      id: user.id,
      ...parsedBasic.data,
      avatar_url: parsedBasic.data.avatar_url || null,
      last_active_at: new Date().toISOString(),
    };

    if (typeof body.onboardingStep === "number") {
      updatePayload.onboarding_step = Math.max(1, Math.min(6, body.onboardingStep));
    }
    if (typeof body.onboardingCompleted === "boolean") {
      updatePayload.onboarding_completed = body.onboardingCompleted;
    }
    if (typeof body.isPublished === "boolean") {
      updatePayload.is_published = body.isPublished;
    }

    const { error: profErr } = await supabase
      .from("profiles")
      .upsert(updatePayload, { onConflict: "id" });

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 400 });
    }
  } else if (
    typeof body.onboardingStep === "number" ||
    typeof body.onboardingCompleted === "boolean" ||
    typeof body.isPublished === "boolean"
  ) {
    const statusUpdate: Record<string, unknown> = {
      last_active_at: new Date().toISOString(),
    };
    if (typeof body.onboardingStep === "number") {
      statusUpdate.onboarding_step = Math.max(1, Math.min(6, body.onboardingStep));
    }
    if (typeof body.onboardingCompleted === "boolean") {
      statusUpdate.onboarding_completed = body.onboardingCompleted;
    }
    if (typeof body.isPublished === "boolean") {
      statusUpdate.is_published = body.isPublished;
    }

    const { error: statusErr } = await supabase
      .from("profiles")
      .update(statusUpdate)
      .eq("id", user.id);

    if (statusErr) {
      return NextResponse.json({ error: statusErr.message }, { status: 400 });
    }
  }

  // 2. Validate & Upsert Lifestyle Preferences if provided
  if (body.lifestyle) {
    const parsedLife = lifestylePreferencesSchema.safeParse(body.lifestyle);
    if (!parsedLife.success) {
      return NextResponse.json(
        { error: parsedLife.error.issues[0]?.message || "Invalid lifestyle preferences" },
        { status: 400 }
      );
    }

    const { error: lifeErr } = await supabase
      .from("lifestyle_preferences")
      .upsert({ user_id: user.id, ...parsedLife.data }, { onConflict: "user_id" });

    if (lifeErr) {
      return NextResponse.json({ error: lifeErr.message }, { status: 400 });
    }
  }

  // 3. Validate & Upsert Personality Preferences if provided
  if (body.personality) {
    const parsedPers = personalityPreferencesSchema.safeParse(body.personality);
    if (!parsedPers.success) {
      return NextResponse.json(
        { error: parsedPers.error.issues[0]?.message || "Invalid personality preferences" },
        { status: 400 }
      );
    }

    const { error: persErr } = await supabase
      .from("personality_preferences")
      .upsert({ user_id: user.id, ...parsedPers.data }, { onConflict: "user_id" });

    if (persErr) {
      return NextResponse.json({ error: persErr.message }, { status: 400 });
    }
  }

  // 4. Validate & Upsert Living Preferences if provided
  if (body.living) {
    const parsedLiv = livingPreferencesSchema.safeParse(body.living);
    if (!parsedLiv.success) {
      return NextResponse.json(
        { error: parsedLiv.error.issues[0]?.message || "Invalid living preferences" },
        { status: 400 }
      );
    }

    const { error: livErr } = await supabase
      .from("living_preferences")
      .upsert({ user_id: user.id, ...parsedLiv.data }, { onConflict: "user_id" });

    if (livErr) {
      return NextResponse.json({ error: livErr.message }, { status: 400 });
    }
  }

  // 5. Validate & Upsert Preference Importance if provided
  if (Array.isArray(body.importance)) {
    const parsedImp = preferenceImportanceArraySchema.safeParse(body.importance);
    if (!parsedImp.success) {
      return NextResponse.json(
        { error: parsedImp.error.issues[0]?.message || "Invalid preference importance settings" },
        { status: 400 }
      );
    }

    if (parsedImp.data.length > 0) {
      const rows = parsedImp.data.map((item) => ({
        user_id: user.id,
        question_key: item.question_key,
        importance: item.importance,
        is_dealbreaker: item.is_dealbreaker,
      }));

      const { error: impErr } = await supabase
        .from("preference_importance")
        .upsert(rows, { onConflict: "user_id,question_key" });

      if (impErr) {
        return NextResponse.json({ error: impErr.message }, { status: 400 });
      }
    }
  }

  // 6. Validate & Upsert Privacy Preferences if provided
  if (body.privacy) {
    const parsedPriv = privacyPreferencesSchema.safeParse(body.privacy);
    if (!parsedPriv.success) {
      return NextResponse.json(
        { error: parsedPriv.error.issues[0]?.message || "Invalid privacy preferences" },
        { status: 400 }
      );
    }

    const { error: privErr } = await supabase
      .from("privacy_preferences")
      .upsert({ user_id: user.id, ...parsedPriv.data }, { onConflict: "user_id" });

    if (privErr) {
      return NextResponse.json({ error: privErr.message }, { status: 400 });
    }
  }

  return NextResponse.json({ saved: true });
}
