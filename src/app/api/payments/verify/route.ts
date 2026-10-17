import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRazorpayConfigStatus } from "@/lib/env";
import {
  PREMIUM_PRICE_INR,
  verifyRazorpayPaymentSignature,
} from "@/lib/entitlements";

export async function POST(request: Request) {
  const rzpConfig = getRazorpayConfigStatus();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";

  if (!rzpConfig.isConfigured || !keySecret) {
    return NextResponse.json(
      {
        error: `Razorpay credentials are not configured (${rzpConfig.missingVars.join(", ")}). Cannot verify payment.`,
      },
      { status: 503 }
    );
  }

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

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Strictly verify cryptographic HMAC-SHA256 signature; never trust client flags
  const isSignatureValid = verifyRazorpayPaymentSignature({
    orderId: body.razorpay_order_id || "",
    paymentId: body.razorpay_payment_id || "",
    signature: body.razorpay_signature || "",
    keySecret,
  });

  if (!isSignatureValid) {
    return NextResponse.json(
      {
        verified: false,
        error: "Invalid cryptographic payment signature. Premium was not unlocked.",
      },
      { status: 400 }
    );
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is required on the server to write verified subscription entitlements.",
      },
      { status: 503 }
    );
  }

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const { error: subErr } = await adminClient.from("subscriptions").upsert(
    {
      user_id: user.id,
      tier: "premium",
      status: "active",
      price_inr: PREMIUM_PRICE_INR,
      provider: "razorpay",
      provider_order_id: body.razorpay_order_id,
      provider_payment_id: body.razorpay_payment_id,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    },
    { onConflict: "user_id" }
  );

  if (subErr) {
    return NextResponse.json({ error: subErr.message }, { status: 500 });
  }

  await adminClient.from("notifications").insert({
    user_id: user.id,
    type: "subscription_updated",
    title: "SpaceSync Premium Activated",
    body: "Your ₹199/month Premium subscription is now active. Advanced filters and deeper compatibility insights are unlocked.",
    action_url: "/discover",
  });

  return NextResponse.json({ verified: true, tier: "premium" });
}
