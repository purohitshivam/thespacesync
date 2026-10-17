import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseConfigStatus } from "@/lib/env";
import { waitlistSignupSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const config = getSupabaseConfigStatus();
  if (!config.isConfigured) {
    return NextResponse.json(
      {
        error: `Supabase database is not configured in this environment (Missing: ${config.missingVars.join(", ")}). SpaceSync never simulates waitlist sign-ups.`,
      },
      { status: 503 }
    );
  }

  const forwarded = request.headers.get("x-forwarded-for") || "local";
  const rl = checkRateLimit({
    key: `waitlist:${forwarded}`,
    limit: 8,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Please try again in ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = waitlistSignupSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid waitlist input" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Database client unavailable." },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("waitlist_entries").insert({
    email: parsed.data.email.trim().toLowerCase(),
    intended_city: parsed.data.intended_city,
    moving_timeline: parsed.data.moving_timeline ?? null,
    consent_communications: parsed.data.consent_communications,
  });

  if (error) {
    if (error.code === "23505" || error.message.toLowerCase().includes("duplicate")) {
      return NextResponse.json(
        { error: "This email address is already registered on the SpaceSync waitlist." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    saved: true,
    message: `Your email (${parsed.data.email}) has been recorded for the ${parsed.data.intended_city} launch cohort.`,
  });
}
