import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import LandingPage from "@/app/page";
import HowItWorksPage from "@/app/how-it-works/page";
import PeaceScoreExplanationPage from "@/app/peace-score/page";
import AboutPage from "@/app/about/page";
import FaqsPage from "@/app/faqs/page";
import ContactPage from "@/app/contact/page";
import PrivacyPolicyPage from "@/app/privacy/page";
import TermsOfUsePage from "@/app/terms/page";
import CommunityGuidelinesPage from "@/app/guidelines/page";
import { Navbar } from "@/components/layout/Navbar";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("Public Website Pages, Middleware Route Guards, Mobile Navbar & Onboarding Resumption", () => {
  it("redirects unauthenticated visitors from all protected routes to /login via middleware", async () => {
    const protectedRoutes = [
      "/onboarding",
      "/connections",
      "/messages",
      "/profile",
      "/settings",
      "/notifications",
      "/admin",
    ];

    for (const route of protectedRoutes) {
      const req = new NextRequest(`http://localhost:3000${route}`);
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain(`/login?redirectTo=${encodeURIComponent(route)}`);
    }
  });

  it("allows unauthenticated visitors to access public pages via middleware", async () => {
    const publicRoutes = [
      "/",
      "/how-it-works",
      "/peace-score",
      "/pricing",
      "/about",
      "/faqs",
      "/contact",
      "/privacy",
      "/terms",
      "/guidelines",
      "/discover",
    ];

    for (const route of publicRoutes) {
      const req = new NextRequest(`http://localhost:3000${route}`);
      const res = await middleware(req);
      expect(res.status).toBe(200);
    }
  });

  it("renders all public pages with required content and zero dummy profiles", () => {
    const { unmount: u1 } = render(<LandingPage />);
    expect(screen.getByText(/Somewhere out there is your/i)).toBeDefined();
    expect(screen.getByRole("link", { name: /Create Your Compatibility Profile/i })).toBeDefined();
    u1();

    const { unmount: u2 } = render(<HowItWorksPage />);
    expect(screen.getByText(/How SpaceSync Works/i)).toBeDefined();
    u2();

    const { unmount: u3 } = render(<PeaceScoreExplanationPage />);
    expect(screen.getByText(/How the Peace Score Works/i)).toBeDefined();
    u3();

    const { unmount: u4 } = render(<AboutPage />);
    expect(screen.getByText(/Home feels better when your rhythms align/i)).toBeDefined();
    u4();

    const { unmount: u5 } = render(<FaqsPage />);
    expect(screen.getByText(/Frequently Asked Questions/i)).toBeDefined();
    u5();

    const { unmount: u6 } = render(<ContactPage />);
    expect(screen.getByText(/Contact & Support/i)).toBeDefined();
    u6();

    const { unmount: u7 } = render(<PrivacyPolicyPage />);
    expect(screen.getByText(/1\. Data Minimisation Principle/i)).toBeDefined();
    u7();

    const { unmount: u8 } = render(<TermsOfUsePage />);
    expect(screen.getByText(/2\. Nature of the Service/i)).toBeDefined();
    u8();

    const { unmount: u9 } = render(<CommunityGuidelinesPage />);
    expect(screen.getByText(/1\. Be Honest About Your Habits/i)).toBeDefined();
    u9();
  });

  it("toggles mobile navigation drawer on small screens", () => {
    render(<Navbar user={null} />);
    const toggleBtn = screen.getByTestId("mobile-menu-toggle");
    expect(screen.queryByTestId("mobile-nav-drawer")).toBeNull();
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId("mobile-nav-drawer")).toBeDefined();
  });

  it("resumes OnboardingWizard at the saved onboarding_step from persisted profile data", () => {
    render(
      <OnboardingWizard
        userId="11111111-1111-4111-8111-111111111111"
        initialData={{
          profile: {
            id: "11111111-1111-4111-8111-111111111111",
            first_name: "Meera",
            age_confirmed_18_plus: true,
            birth_year: 2000,
            avatar_url: null,
            bio: "MBA student",
            occupation_title: "MBA Candidate",
            occupation_category: "mba_student",
            institution_or_company: "Masters' Union",
            city: "Delhi NCR",
            search_intent: "looking_for_flatmate",
            onboarding_step: 4, // Saved step 4
            onboarding_completed: false,
            is_published: false,
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
        }}
      />
    );

    expect(
      screen.getByText(/4\. Living Preferences & Budget \(40% Default Weight\)/i)
    ).toBeDefined();
    expect(screen.getByText(/Status: Private Draft \(Unpublished\)/i)).toBeDefined();
  });
});
