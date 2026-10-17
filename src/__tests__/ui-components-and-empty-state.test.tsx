import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  EmptyOrbitState,
  PeaceScoreArchitectureDiagram,
} from "@/components/ui/OrbitalGraphics";
import {
  PeaceScoreBadge,
  PeaceScoreBreakdownCard,
} from "@/components/ui/PeaceScoreBadge";
import { ConfigStatusBanner } from "@/components/ui/ConfigStatusBanner";
import { calculatePeaceScore } from "@/lib/peace-score";
import type { FullUserProfile } from "@/types/database";

describe("UI Components, Empty States & Peace Score Rendering", () => {
  it("renders the honest EmptyOrbitState with zero fabricated users", () => {
    render(<EmptyOrbitState />);
    expect(
      screen.getByText("There isn't anyone in your orbit just yet.")
    ).toBeDefined();
    expect(screen.getByTestId("empty-orbit-state")).toBeDefined();
  });

  it("renders PeaceScoreArchitectureDiagram explicitly labelled as a system illustration", () => {
    render(<PeaceScoreArchitectureDiagram />);
    expect(
      screen.getByText(/System Illustration — Deterministic Formula \(Not a Live User Profile\)/i)
    ).toBeDefined();
  });

  it("renders ConfigStatusBanner listing exact missing environment variables", () => {
    render(
      <ConfigStatusBanner
        serviceName="Supabase"
        missingVars={["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]}
      />
    );
    expect(
      screen.getByText(/NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY/i)
    ).toBeDefined();
  });

  it("renders incomplete-data state in PeaceScoreBadge and PeaceScoreBreakdownCard when answers are insufficient", () => {
    const emptyProfile: FullUserProfile = {
      profile: {
        id: "00000000-0000-4000-8000-000000000001",
        first_name: "A",
        age_confirmed_18_plus: true,
        birth_year: 2000,
        avatar_url: null,
        bio: "",
        occupation_title: "",
        occupation_category: "student",
        institution_or_company: "",
        city: "Bangalore",
        search_intent: "looking_for_flatmate",
        onboarding_step: 1,
        onboarding_completed: true,
        is_published: true,
        is_email_verified: true,
        account_status: "active",
        is_admin: false,
        last_active_at: "2026-10-17T00:00:00Z",
        created_at: "2026-10-17T00:00:00Z",
        updated_at: "2026-10-17T00:00:00Z",
      },
      lifestyle: null,
      personality: null,
      living: null,
      importance: [],
    };

    const result = calculatePeaceScore(emptyProfile, emptyProfile);
    render(
      <div>
        <PeaceScoreBadge result={result} />
        <PeaceScoreBreakdownCard result={result} />
      </div>
    );

    expect(screen.getAllByText(/Incomplete Data/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/Insufficient overlapping answers to compute a score/i)
    ).toBeDefined();
  });
});
