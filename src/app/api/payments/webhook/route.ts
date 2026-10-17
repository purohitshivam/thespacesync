import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  PREMIUM_PRICE_INR,
  verifyRazorpayWebhookSignature,
} from "@/lib/entitlements";

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || "";
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "RAZORPAY_WEBHOOK_SECRET is not configured on the server." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("x-razorpay-signature") || "";
  const rawBody = await request.text();

  const isValid = verifyRazorpayWebhookSignature({
    rawBody,
    signature,
    webhookSecret,
  });

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  let eventPayload: {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          notes?: { user_id?: string };
        };
      };
    };
  };

  try {
    eventPayload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 503 }
    );
  }

  const eventType = eventPayload.event;
  const paymentEntity = eventPayload.payload?.payment?.entity;
  const paymentId = paymentEntity?.id;
  const orderId = paymentEntity?.order_id;
  const userId = paymentEntity?.notes?.user_id;

  if (eventType === "payment.captured" && paymentId && userId) {
    // Idempotency check: if provider_payment_id was already processed, return 200 immediately
    const { data: existing } = await adminClient
      .from("subscriptions")
      .select("id")
      .eq("provider_payment_id", paymentId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ received: true, idempotentDuplicate: true });
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await adminClient.from("subscriptions").upsert(
      {
        user_id: userId,
        tier: "premium",
        status: "active",
        price_inr: PREMIUM_PRICE_INR,
        provider: "razorpay",
        provider_order_id: orderId ?? null,
        provider_payment_id: paymentId,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
      },
      { onConflict: "user_id" }
    );
  }

  return NextResponse.json({ received: true });
}
