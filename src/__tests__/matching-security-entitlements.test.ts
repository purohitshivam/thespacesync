import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import {
  canonicaliseUserPair,
  verifyConversationAccess,
  verifyInteractionPermission,
} from "@/lib/matching/rules";
import {
  evaluateSubscriptionEntitlements,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/entitlements";
import {
  sanitiseText,
  signupSchema,
  livingPreferencesSchema,
  waitlistSignupSchema,
  sendMessageSchema,
  reportUserSchema,
} from "@/lib/validations";
import {
  checkRateLimit,
  resetRateLimitStoreForTests,
} from "@/lib/security/rate-limit";

describe("Matching Rules, Authorisation, Validation, Entitlements & Signatures", () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
  });

  describe("Canonical User Pair & Self-Match Prevention", () => {
    it("orders user pairs deterministically regardless of sender/receiver order", () => {
      const a = "11111111-1111-4111-8111-111111111111";
      const b = "22222222-2222-4222-8222-222222222222";

      expect(canonicaliseUserPair(a, b)).toEqual({ userOneId: a, userTwoId: b });
      expect(canonicaliseUserPair(b, a)).toEqual({ userOneId: a, userTwoId: b });
    });

    it("throws on self-matching attempts", () => {
      const a = "11111111-1111-4111-8111-111111111111";
      expect(() => canonicaliseUserPair(a, a)).toThrow(/Self-matching is not permitted/);
    });
  });

  describe("Interaction & Conversation Authorisation Guards", () => {
    it("rejects unauthenticated, self, suspended, blocked, or unpublished targets", () => {
      expect(
        verifyInteractionPermission({
          actorUserId: null,
          targetUserId: "u2",
          actorAccountStatus: "active",
          targetAccountStatus: "active",
          targetIsPublished: true,
          isBlockedBetween: false,
        }).httpStatus
      ).toBe(401);

      expect(
        verifyInteractionPermission({
          actorUserId: "u1",
          targetUserId: "u1",
          actorAccountStatus: "active",
          targetAccountStatus: "active",
          targetIsPublished: true,
          isBlockedBetween: false,
        }).httpStatus
      ).toBe(400);

      expect(
        verifyInteractionPermission({
          actorUserId: "u1",
          targetUserId: "u2",
          actorAccountStatus: "suspended",
          targetAccountStatus: "active",
          targetIsPublished: true,
          isBlockedBetween: false,
        }).httpStatus
      ).toBe(403);

      expect(
        verifyInteractionPermission({
          actorUserId: "u1",
          targetUserId: "u2",
          actorAccountStatus: "active",
          targetAccountStatus: "active",
          targetIsPublished: true,
          isBlockedBetween: true,
        }).httpStatus
      ).toBe(403);

      expect(
        verifyInteractionPermission({
          actorUserId: "u1",
          targetUserId: "u2",
          actorAccountStatus: "active",
          targetAccountStatus: "active",
          targetIsPublished: false,
          isBlockedBetween: false,
        }).httpStatus
      ).toBe(403);
    });

    it("permits conversation access strictly to active matched unblocked participants", () => {
      // Non-participant rejected with 403
      expect(
        verifyConversationAccess({
          actorUserId: "u-intruder",
          actorAccountStatus: "active",
          conversationUserOneId: "u1",
          conversationUserTwoId: "u2",
          matchStatus: "active",
          isBlockedBetween: false,
        })
      ).toEqual({
        allowed: false,
        reason: "Unauthorised: You are not a participant in this conversation.",
        httpStatus: 403,
      });

      // Blocked participant rejected with 403
      expect(
        verifyConversationAccess({
          actorUserId: "u1",
          actorAccountStatus: "active",
          conversationUserOneId: "u1",
          conversationUserTwoId: "u2",
          matchStatus: "active",
          isBlockedBetween: true,
        }).allowed
      ).toBe(false);

      // Suspended participant rejected with 403
      expect(
        verifyConversationAccess({
          actorUserId: "u1",
          actorAccountStatus: "suspended",
          conversationUserOneId: "u1",
          conversationUserTwoId: "u2",
          matchStatus: "active",
          isBlockedBetween: false,
        }).allowed
      ).toBe(false);

      // Authorised participant allowed
      expect(
        verifyConversationAccess({
          actorUserId: "u1",
          actorAccountStatus: "active",
          conversationUserOneId: "u1",
          conversationUserTwoId: "u2",
          matchStatus: "active",
          isBlockedBetween: false,
        }).allowed
      ).toBe(true);
    });
  });

  describe("Input Sanitisation & Zod Schemas", () => {
    it("strips script tags and control characters from user text", () => {
      const dirty = `<script>alert('xss')</script>Hello <b>Flatmate</b>\u0000`;
      expect(sanitiseText(dirty)).toBe("Hello Flatmate");
    });

    it("enforces 18+ age confirmation on signup", () => {
      const res = signupSchema.safeParse({
        firstName: "Aarav",
        email: "aarav@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        ageConfirmed18Plus: false,
      });
      expect(res.success).toBe(false);
    });

    it("enforces budget_min_inr <= budget_max_inr", () => {
      const invalid = livingPreferencesSchema.safeParse({
        budget_min_inr: 35000,
        budget_max_inr: 20000,
      });
      expect(invalid.success).toBe(false);

      const valid = livingPreferencesSchema.safeParse({
        budget_min_inr: 20000,
        budget_max_inr: 35000,
      });
      expect(valid.success).toBe(true);
    });

    it("enforces waitlist email validity and communication consent", () => {
      expect(
        waitlistSignupSchema.safeParse({
          email: "valid@example.com",
          intended_city: "Bangalore",
          consent_communications: false,
        }).success
      ).toBe(false);

      expect(
        waitlistSignupSchema.safeParse({
          email: "valid@example.com",
          intended_city: "Bangalore",
          consent_communications: true,
        }).success
      ).toBe(true);
    });

    it("validates messages and reports", () => {
      expect(
        sendMessageSchema.safeParse({
          conversationId: "11111111-1111-4111-8111-111111111111",
          body: "   ",
        }).success
      ).toBe(false);

      expect(
        reportUserSchema.safeParse({
          reportedUserId: "11111111-1111-4111-8111-111111111111",
          reason: "harassment_or_abuse",
          description: "Valid report",
        }).success
      ).toBe(true);
    });
  });

  describe("Freemium & Premium Entitlements and Cryptographic Payment Verification", () => {
    it("grants Free tier when subscription is null, expired, or non-active", () => {
      expect(evaluateSubscriptionEntitlements(null).isPremium).toBe(false);

      const expiredSub = {
        id: "sub-1",
        user_id: "u-1",
        tier: "premium" as const,
        status: "active" as const,
        price_inr: 199,
        provider: "razorpay",
        provider_order_id: "ord_1",
        provider_payment_id: "pay_1",
        provider_subscription_id: null,
        current_period_start: "2025-01-01T00:00:00Z",
        current_period_end: "2025-02-01T00:00:00Z",
        cancel_at_period_end: false,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };
      expect(
        evaluateSubscriptionEntitlements(expiredSub, new Date("2026-10-17T00:00:00Z")).isPremium
      ).toBe(false);
    });

    it("grants Premium entitlements only for active, unexpired Premium subscriptions", () => {
      const activeSub = {
        id: "sub-2",
        user_id: "u-1",
        tier: "premium" as const,
        status: "active" as const,
        price_inr: 199,
        provider: "razorpay",
        provider_order_id: "ord_2",
        provider_payment_id: "pay_2",
        provider_subscription_id: null,
        current_period_start: "2026-10-01T00:00:00Z",
        current_period_end: "2026-11-01T00:00:00Z",
        cancel_at_period_end: false,
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      };

      const ent = evaluateSubscriptionEntitlements(
        activeSub,
        new Date("2026-10-17T00:00:00Z")
      );
      expect(ent.isPremium).toBe(true);
      expect(ent.canUseAdvancedFilters).toBe(true);
      expect(ent.canViewDeepCompatibilityInsights).toBe(true);
      expect(ent.hasPriorityVisibility).toBe(true);
    });

    it("verifies authentic HMAC-SHA256 Razorpay payment and webhook signatures and rejects forged ones", () => {
      const secret = "test_secret_key_999";
      const orderId = "order_P999";
      const paymentId = "pay_Q888";
      const validSig = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      expect(
        verifyRazorpayPaymentSignature({
          orderId,
          paymentId,
          signature: validSig,
          keySecret: secret,
        })
      ).toBe(true);

      expect(
        verifyRazorpayPaymentSignature({
          orderId,
          paymentId,
          signature: "forged_signature_12345",
          keySecret: secret,
        })
      ).toBe(false);

      const rawWebhook = JSON.stringify({ event: "payment.captured" });
      const validWebhookSig = crypto
        .createHmac("sha256", secret)
        .update(rawWebhook)
        .digest("hex");

      expect(
        verifyRazorpayWebhookSignature({
          rawBody: rawWebhook,
          signature: validWebhookSig,
          webhookSecret: secret,
        })
      ).toBe(true);

      expect(
        verifyRazorpayWebhookSignature({
          rawBody: rawWebhook,
          signature: "invalid",
          webhookSecret: secret,
        })
      ).toBe(false);
    });
  });

  describe("Server-Side Rate Limiter", () => {
    it("blocks requests exceeding the configured window limit", () => {
      expect(checkRateLimit({ key: "k1", limit: 2, windowMs: 10000 }).allowed).toBe(true);
      expect(checkRateLimit({ key: "k1", limit: 2, windowMs: 10000 }).allowed).toBe(true);
      const blocked = checkRateLimit({ key: "k1", limit: 2, windowMs: 10000 });
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    });
  });
});
