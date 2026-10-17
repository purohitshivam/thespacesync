import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";
  const safeNext = next.startsWith("/") ? next : "/onboarding";

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        await supabase
          .from("profiles")
          .update({ is_email_verified: true })
          .eq("id", data.user.id);

        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?reason=verification_failed`);
}
