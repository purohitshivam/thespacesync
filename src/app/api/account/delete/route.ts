import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: { confirmation?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.confirmation !== "DELETE MY ACCOUNT") {
    return NextResponse.json(
      { error: "Please type DELETE MY ACCOUNT to confirm permanent account deletion." },
      { status: 400 }
    );
  }

  // If service-role admin client is configured, delete user from auth.users (cascades all tables)
  const adminClient = createSupabaseAdminClient();
  if (adminClient) {
    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }
    await supabase.auth.signOut();
    return NextResponse.json({ deleted: true });
  }

  // If service-role key is not present, anonymise/unpublish and mark deleted before signing out
  const { error: fallbackErr } = await supabase
    .from("profiles")
    .update({
      first_name: "Deleted User",
      bio: "",
      avatar_url: null,
      institution_or_company: "",
      occupation_title: "",
      is_published: false,
      onboarding_completed: false,
    })
    .eq("id", user.id);

  if (fallbackErr) {
    return NextResponse.json({ error: fallbackErr.message }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ deleted: true });
}
