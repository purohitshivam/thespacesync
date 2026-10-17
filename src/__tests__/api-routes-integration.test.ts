import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => mockSupabaseClient),
}));

vi.mock("@/lib/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env")>();
  return {
    ...actual,
    getSupabaseConfigStatus: vi.fn(() => ({
      isConfigured: true,
      hasServiceRole: false,
      url: "https://example.supabase.co",
      anonKey: "anon-key",
      missingVars: [],
    })),
  };
});

import { POST as postInterest } from "@/app/api/interests/route";
import { POST as postMessage } from "@/app/api/messages/route";
import { POST as postBlock } from "@/app/api/safety/block/route";
import { POST as postReport } from "@/app/api/safety/report/route";
import { DELETE as deleteAccount } from "@/app/api/account/delete/route";
import { POST as postModerate } from "@/app/api/admin/moderate/route";
import { POST as postWaitlist } from "@/app/api/waitlist/route";
import { resetRateLimitStoreForTests } from "@/lib/security/rate-limit";

describe("API Route Handlers Integration & Security Enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStoreForTests();
  });

  it("rejects unauthenticated interest requests with 401", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null } });

    const req = new Request("http://localhost:3000/api/interests", {
      method: "POST",
      body: JSON.stringify({
        targetUserId: "22222222-2222-4222-8222-222222222222",
        action: "interest",
      }),
    });

    const res = await postInterest(req);
    expect(res.status).toBe(401);
  });

  it("prevents self-matching in /api/interests with 400", async () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: userId } },
    });

    const req = new Request("http://localhost:3000/api/interests", {
      method: "POST",
      body: JSON.stringify({
        targetUserId: userId,
        action: "interest",
      }),
    });

    const res = await postInterest(req);
    expect(res.status).toBe(400);
  });

  it("creates mutual match atomically via express_interest_transaction RPC", async () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    const targetId = "22222222-2222-4222-8222-222222222222";
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: userId } },
    });
    mockSupabaseClient.rpc.mockResolvedValueOnce({
      data: {
        status: "accepted",
        matched: true,
        match_id: "33333333-3333-4333-8333-333333333333",
        conversation_id: "44444444-4444-4444-8444-444444444444",
      },
      error: null,
    });

    const req = new Request("http://localhost:3000/api/interests", {
      method: "POST",
      body: JSON.stringify({
        targetUserId: targetId,
        action: "interest",
        introNote: "Let's team up in Indiranagar!",
        peaceScore: 89,
      }),
    });

    const res = await postInterest(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.matched).toBe(true);
    expect(json.conversation_id).toBe("44444444-4444-4444-8444-444444444444");
  });

  it("rejects unauthorised non-participants attempting to send a message in /api/messages", async () => {
    const intruderId = "99999999-9999-4999-8999-999999999999";
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: intruderId } },
    });

    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { account_status: "active" } }),
            }),
          }),
        };
      }
      if (table === "conversations") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: "44444444-4444-4444-8444-444444444444",
                  match_id: "33333333-3333-4333-8333-333333333333",
                  user_one_id: "11111111-1111-4111-8111-111111111111",
                  user_two_id: "22222222-2222-4222-8222-222222222222",
                },
              }),
            }),
          }),
        };
      }
      if (table === "matches") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { status: "active" } }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          or: () => ({
            maybeSingle: async () => ({ data: null }),
          }),
        }),
      };
    });

    const req = new Request("http://localhost:3000/api/messages", {
      method: "POST",
      body: JSON.stringify({
        conversationId: "44444444-4444-4444-8444-444444444444",
        body: "Unauthorised message attempt",
      }),
    });

    const res = await postMessage(req);
    expect(res.status).toBe(403);
  });

  it("prevents self-blocking and self-reporting", async () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
    });

    const blockReq = new Request("http://localhost:3000/api/safety/block", {
      method: "POST",
      body: JSON.stringify({ blockedUserId: userId }),
    });
    expect((await postBlock(blockReq)).status).toBe(400);

    const reportReq = new Request("http://localhost:3000/api/safety/report", {
      method: "POST",
      body: JSON.stringify({
        reportedUserId: userId,
        reason: "spam_or_commercial_solicitation",
      }),
    });
    expect((await postReport(reportReq)).status).toBe(400);
  });

  it("rejects non-admin users from /api/admin/moderate with 403", async () => {
    const regularUserId = "11111111-1111-4111-8111-111111111111";
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: regularUserId, email: "regular@example.com" } },
    });
    mockSupabaseClient.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { is_admin: false, account_status: "active" },
          }),
        }),
      }),
    });

    const req = new Request("http://localhost:3000/api/admin/moderate", {
      method: "POST",
      body: JSON.stringify({
        actionType: "suspend_user",
        targetUserId: "22222222-2222-4222-8222-222222222222",
      }),
    });

    const res = await postModerate(req);
    expect(res.status).toBe(403);
  });

  it("requires explicit 'DELETE MY ACCOUNT' confirmation before deleting account", async () => {
    const userId = "11111111-1111-4111-8111-111111111111";
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: userId } },
    });

    const badReq = new Request("http://localhost:3000/api/account/delete", {
      method: "DELETE",
      body: JSON.stringify({ confirmation: "wrong text" }),
    });
    expect((await deleteAccount(badReq)).status).toBe(400);
  });

  it("prevents duplicate waitlist sign-ups with 409 Conflict", async () => {
    mockSupabaseClient.from.mockReturnValueOnce({
      insert: async () => ({
        error: { code: "23505", message: "duplicate key value violates unique constraint" },
      }),
    });

    const req = new Request("http://localhost:3000/api/waitlist", {
      method: "POST",
      body: JSON.stringify({
        email: "cohort@mastersunion.org",
        intended_city: "Delhi NCR",
        moving_timeline: "within_1_month",
        consent_communications: true,
      }),
    });

    const res = await postWaitlist(req);
    expect(res.status).toBe(409);
  });
});
