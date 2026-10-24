# SpaceSync — Product Marketing Context (`.agents/product-marketing.md`)

*Last updated: 2026-10-22 (`v3` — Verified against live `https://www.thespacesync.in` & codebase)*  
*Canonical Product URL: `https://www.thespacesync.in`*

---

## 1. Product Overview & Core Promise

- **Product Name:** SpaceSync
- **Tagline / Descriptor:** `PEACEFUL FLATSHARING` (`Navbar.tsx`) · *"People-First Flatmate Compatibility"* (`src/app/page.tsx`)
- **Hero Headline (`src/app/page.tsx`):** *"Somewhere out there is your perfect flatmate."*
- **Core Problem Statement (`src/app/page.tsx`):** *"A great balcony won't fix a 2 AM kitchen clash. Finding a flat is only half the story — who you share the kitchen, quiet hours, and utility bills with shapes your daily peace of mind."*
- **Core Brand Promise:** Measure lifestyle, living, and communication compatibility **before** you sign a lease or share a set of keys, using SpaceSync's transparent, rules-based **Peace Score** (`0–100%`).

---

## 2. Narrow Ideal Customer Profile (10-Day Zero-Budget Focus)

- **Target Segment:** Early-career working professionals, students, and MBA cohorts (ages 21–29) searching for a flatmate or replacement room in **Bengaluru (`Bangalore`)**, **Mumbai**, **Delhi NCR**, **Pune**, or **Hyderabad** (`₹12,000–₹35,000/month` per-person rent).
- **Primary Trigger:** Within 14–45 days of a lease start/renewal or filling a vacant room in a 2BHK/3BHK; frustrated by chaotic Facebook/WhatsApp/Reddit flatmate threads that list rent and room photos while hiding daily household habits.
- **Core Jobs-To-Be-Done (JTBD):**
  1. Screen out non-negotiable deal-breakers (strictly vegetarian kitchen vs. non-veg cooking, indoor smoking, pet allergies) before wasting a weekend on flat visits.
  2. Align on daily habits (sleep schedule, kitchen reset speed, overnight guests, WFH call zones, AC/utility split) upfront.
  3. Share a single structured compatibility profile link instead of answering the same 15 lifestyle questions in every DM.

---

## 3. Permitted Claims & Exact Verification Sources

> **Zero-Fabrication Rule:** Never invent user counts, match volumes, testimonials, or fake user profiles. Every claim in copy or visuals must trace to the verified table below.

| Claim ID | Permitted Claim | Exact Verification Source |
| :--- | :--- | :--- |
| **C-01** | **Deterministic 0–100% Peace Score (`40 / 40 / 20` Weighted Formula)** — calculated from two real users' saved answers across **Lifestyle & Daily Habits (`40%`)**, **Living Preferences & Budget (`40%`)**, and **Personality & Communication (`20%`)**, weighted by each user's chosen importance multiplier (`Low = 0.6×`, `Medium = 1.0×`, `High = 1.5×`). | [`src/lib/peace-score/index.ts`](../src/lib/peace-score/index.ts) & [`src/app/peace-score/page.tsx`](../src/app/peace-score/page.tsx) |
| **C-02** | **Explicit Non-Negotiable Deal-Breaker Flagging** — when a flagged deal-breaker (e.g., strict veg kitchen, smoke-free indoors, pet allergy) falls at or below the conflict threshold (`35/100`), SpaceSync flags it explicitly and caps the Peace Score at `49%` while showing the unpenalised score alongside it. | [`src/lib/peace-score/index.ts`](../src/lib/peace-score/index.ts) & [`src/app/peace-score/page.tsx`](../src/app/peace-score/page.tsx) (line 68) |
| **C-03** | **Honest Missing-Data Handling (Zero Guessed Averages)** — skipped optional questions are excluded from the denominator rather than guessed; if fewer than 4 dimensions are mutually answered, SpaceSync shows an honest **`Incomplete Data`** badge. | [`src/lib/peace-score/index.ts`](../src/lib/peace-score/index.ts) & [`src/app/peace-score/page.tsx`](../src/app/peace-score/page.tsx) (line 48) |
| **C-04** | **Complementary Habits Rewarded** — e.g., a daily cook paired with someone who mostly orders in scores `92/100` on kitchen usage because they rarely crowd the stove at the same time. | [`src/app/peace-score/page.tsx`](../src/app/peace-score/page.tsx) (line 58) |
| **C-05** | **Privacy-First Unpublished Draft Default & Mutual Sync Handshake** — new accounts start in an unpublished draft state until onboarding is completed and explicitly published; private chat unlocks only after mutual compatibility acceptance. | [`src/app/how-it-works/page.tsx`](../src/app/how-it-works/page.tsx), [`src/app/matches/page.tsx`](../src/app/matches/page.tsx), & [`src/app/inbox/page.tsx`](../src/app/inbox/page.tsx) |
| **C-06** | **Free Tier (`₹0`) & Transparent Pricing** — free compatibility profile creation, Peace Score breakdown, and discovery; zero property brokerage fees and zero dummy profiles. | [`src/app/pricing/page.tsx`](../src/app/pricing/page.tsx) & [`src/lib/entitlements.ts`](../src/lib/entitlements.ts) |

---

## 4. Brand Voice & Copy Guardrails

- **Tone:** Warm architectural sanctuary — calm, editorial, specific, and non-judgmental.
- **Household Specificity:** Use real Indian flatsharing touchpoints (*2 AM kitchen clashes, 11 PM sink dishes, WFH call zones, Indiranagar / HSR Layout / Bandra West / Cyber City localities, 11-month lease lock-in*).
- **Forbidden Patterns:**
  - No AI contrast clichés (*"It's not X, it's Y"*, *"No X. No Y. No Z."*).
  - No fabricated social proof or invented user/match statistics.
  - Always include `"Illustrative Example — Not a Live User Profile"` when displaying sample compatibility cards on marketing visuals.

---

## 5. Approved CTAs

- **Primary Website CTA (`src/app/page.tsx`):** `Create Your Compatibility Profile` → `https://www.thespacesync.in/signup`
- **Secondary Website CTA (`src/app/page.tsx`):** `How Peace Score Works` → `https://www.thespacesync.in/peace-score`
- **Social Carousel / Reel CTA:** `Calculate Your Peace Score → thespacesync.in`

---

## 6. Pending Items (`PENDING`)

- **Community User / Match Volume Claims:** `PENDING` (`1` verified founder account in production DB; `0` dummy profiles).
- **Customer Testimonials / Quotes:** `PENDING` (`0` collected yet; will log verbatim from real users during the 10-day sprint).
- **Official Social Media Handle Links:** `PENDING` (Using canonical domain `thespacesync.in` until handles are locked).
