import crypto from "crypto";
import type { SubscriptionRow } from "@/types/database";

export interface EntitlementSummary {
  tier: "free" | "premium";
  isPremium: boolean;
  canUseAdvancedFilters: boolean;
  canViewDeepCompatibilityInsights: boolean;
  hasPriorityVisibility: boolean;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export const PREMIUM_PRICE_INR = 199;
export const PREMIUM_PRICE_PAISE = 19900;

/**
 * Evaluates whether a persisted subscription record grants active Premium entitlements.
 * Never trusts client-side flags; relies strictly on server-verified subscription records.
 */
export function evaluateSubscriptionEntitlements(
  sub: SubscriptionRow | null | undefined,
  now: Date = new Date()
): EntitlementSummary {
  if (!sub || sub.tier !== "premium") {
    return {
      tier: "free",
      isPremium: false,
      canUseAdvancedFilters: false,
      canViewDeepCompatibilityInsights: false,
      hasPriorityVisibility: false,
      status: sub?.status ?? "active",
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }

  const isStatusActive = sub.status === "active";
  const isPeriodValid =
    !sub.current_period_end || new Date(sub.current_period_end).getTime() > now.getTime();

  const isPremium = isStatusActive && isPeriodValid;

  return {
    tier: isPremium ? "premium" : "free",
    isPremium,
    canUseAdvancedFilters: isPremium,
    canViewDeepCompatibilityInsights: isPremium,
    hasPriorityVisibility: isPremium,
    status: sub.status,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
  };
}

/**
 * Verifies a Razorpay checkout payment signature using HMAC-SHA256 and timingSafeEqual.
 * Signature payload format: `${orderId}|${paymentId}`
 */
export function verifyRazorpayPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): boolean {
  const { orderId, paymentId, signature, keySecret } = params;
  if (!orderId || !paymentId || !signature || !keySecret) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "utf8");
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    if (sigBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Verifies a signed Razorpay webhook payload using HMAC-SHA256 and timingSafeEqual.
 */
export function verifyRazorpayWebhookSignature(params: {
  rawBody: string;
  signature: string;
  webhookSecret: string;
}): boolean {
  const { rawBody, signature, webhookSecret } = params;
  if (!rawBody || !signature || !webhookSecret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "utf8");
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    if (sigBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}
