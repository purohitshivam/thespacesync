import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Database Schema, RLS Policies & Zero-Dummy-Data Migration Audit", () => {
  const schemaPath = path.resolve(
    __dirname,
    "../../supabase/migrations/0001_initial_schema.sql"
  );
  const rlsPath = path.resolve(
    __dirname,
    "../../supabase/migrations/0002_rls_and_storage_policies.sql"
  );

  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  const rlsSql = fs.readFileSync(rlsPath, "utf8");

  const requiredTables = [
    "profiles",
    "lifestyle_preferences",
    "personality_preferences",
    "living_preferences",
    "preference_importance",
    "privacy_preferences",
    "user_blocks",
    "interests",
    "matches",
    "conversations",
    "messages",
    "reports",
    "moderation_audit_log",
    "subscriptions",
    "notifications",
    "waitlist_entries",
  ];

  it("defines all 16 required relational tables in 0001_initial_schema.sql", () => {
    for (const table of requiredTables) {
      expect(schemaSql).toContain(`CREATE TABLE IF NOT EXISTS public.${table}`);
    }
  });

  it("enables Row Level Security on all 16 tables in 0002_rls_and_storage_policies.sql", () => {
    for (const table of requiredTables) {
      expect(rlsSql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it("enforces is_published = FALSE by default on profiles and in the auth.users trigger", () => {
    expect(schemaSql).toContain("is_published BOOLEAN NOT NULL DEFAULT FALSE");
    expect(rlsSql).toContain("is_published,\n    onboarding_completed");
  });

  it("enforces canonical user_one_id < user_two_id ordering and uniqueness on matches and conversations", () => {
    expect(schemaSql).toContain("CONSTRAINT canonical_match_pair_order CHECK (user_one_id < user_two_id)");
    expect(schemaSql).toContain("CONSTRAINT canonical_conversation_pair_order CHECK (user_one_id < user_two_id)");
    expect(schemaSql).toContain("CONSTRAINT no_self_interest CHECK (sender_id <> receiver_id)");
    expect(schemaSql).toContain("CONSTRAINT no_self_block CHECK (blocker_id <> blocked_id)");
    expect(schemaSql).toContain("CONSTRAINT no_self_report CHECK (reporter_id <> reported_user_id)");
  });

  it("prevents clients from directly inserting matches or modifying subscription entitlements via RLS", () => {
    // Matches table must only have SELECT policy for authenticated users (inserts happen in SECURITY DEFINER RPC)
    expect(rlsSql).toContain('ON public.matches FOR SELECT');
    expect(rlsSql).not.toContain('ON public.matches FOR INSERT');

    // Subscriptions table must only have SELECT policy for authenticated users
    expect(rlsSql).toContain('ON public.subscriptions FOR SELECT');
    expect(rlsSql).not.toContain('ON public.subscriptions FOR INSERT');
    expect(rlsSql).not.toContain('ON public.subscriptions FOR UPDATE');
  });

  it("configures the profile-photos storage bucket and folder-scoped RLS policies", () => {
    expect(rlsSql).toContain("'profile-photos'");
    expect(rlsSql).toContain("ON storage.objects FOR INSERT");
    expect(rlsSql).toContain("(storage.foldername(name))[1] = auth.uid()::text");
  });
});
