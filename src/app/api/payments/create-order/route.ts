import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRazorpayConfigStatus } from "@/lib/env";
import { PREMIUM_PRICE_PAISE } from "@/lib/entitlements";

export async function POST() {
  const rzpConfig = getRazorpayConfigStatus();
  if (!rzpConfig.isConfigured) {
    return NextResponse.json(
      {
        error: `Razorpay payment integration is not configured in this environment. Missing variables: ${rzpConfig.missingVars.join(", ")}.`,
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

  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";
  const basicAuth = Buffer.from(`${rzpConfig.keyId}:${keySecret}`).toString("base64");

  const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      amount: PREMIUM_PRICE_PAISE,
      currency: "INR",
      receipt: `spacesync_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan: "spacesync_premium_monthly",
      },
    }),
  });

  if (!orderResponse.ok) {
    const errText = await orderResponse.text();
    return NextResponse.json(
      { error: `Razorpay order creation failed: ${errText}` },
      { status: 502 }
    );
  }

  const orderData = (await orderResponse.json()) as {
    id: string;
    amount: number;
    currency: string;
  };

  // Store pending provider_order_id on the server
  const adminClient = createSupabaseAdminClient();
  if (adminClient) {
    await adminClient.from("subscriptions").upsert(
      {
        user_id: user.id,
        provider: "razorpay",
        provider_order_id: orderData.id,
      },
      { onConflict: "user_id" }
    );
  }

  return NextResponse.json({
    orderId: orderData.id,
    amount: orderData.amount,
    currency: orderData.currency,
    keyId: rzpConfig.keyId,
  });
}
