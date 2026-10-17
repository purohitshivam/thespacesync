# SpaceSync

> **"Somewhere out there is your perfect flatmate."**

SpaceSync is a full-stack flatmate compatibility and matchmaking web application built for students, MBA cohorts, young professionals, and people relocating across **Bangalore, Mumbai, Delhi NCR**, and beyond.

Unlike property portals or broker classifieds, SpaceSync focuses on **people, living habits, household boundaries, and communication styles** — powered by the deterministic, explainable **Peace Score** engine.

---

## Non-Negotiable Principle: Zero Dummy Data

SpaceSync contains **zero fabricated user profiles, zero hardcoded discovery arrays, zero simulated messages, and zero invented social proof**:
- When the database contains zero published profiles, Discovery renders an honest, warm orbital empty state: *"There isn't anyone in your orbit just yet."*
- Creating an account never automatically publishes a profile (`is_published = FALSE` by default).
- Waitlist confirmations, expressed interests, mutual matches, and chat messages are confirmed in the UI strictly after PostgreSQL persistence succeeds.
- Premium (`₹199/month`) entitlements are unlocked strictly via server-side HMAC-SHA256 signature and webhook verification — never via client flags.

---

## Tech Stack & Architecture

- **Frontend & Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling & Brand**: Tailwind CSS with SpaceSync's warm editorial palette (`#FAF7F1` Warm Ivory, `#EEE5D8` Sand, `#879783` Sage, `#30483A` Forest Green, `#C77D61` Terracotta, `#302F2B` Charcoal) and `Fraunces` + `Plus Jakarta Sans` typography
- **Authentication & Database**: Supabase Auth (`@supabase/ssr`), Supabase PostgreSQL with Row Level Security (RLS) on all 16 tables, Supabase Storage (`profile-photos`), and Supabase Realtime (1-to-1 chat)
- **Validation & Security**: Zod schemas (`src/lib/validations/index.ts`), HTML/control-character sanitisation, and sliding-window server rate limiting (`src/lib/security/rate-limit.ts`)
- **Testing**: Vitest (unit & integration tests) + Playwright (desktop & mobile end-to-end tests)

---

## Project Structure

```text
├── supabase/
│   └── migrations/
│       ├── 0001_initial_schema.sql          # 16 relational tables, enums, indexes, constraints
│       └── 0002_rls_and_storage_policies.sql # RLS policies, auth triggers, atomic RPCs, storage
├── src/
│   ├── app/                                 # Next.js App Router pages & API route handlers
│   │   ├── (public pages)                   # /, /how-it-works, /peace-score, /pricing, /about,
│   │   │                                    # /faqs, /contact, /privacy, /terms, /guidelines
│   │   ├── login/, signup/, forgot-password/, reset-password/, auth/callback/
│   │   ├── onboarding/, profile/, discover/, connections/, messages/, notifications/, settings/, admin/
│   │   └── api/                             # Server-side endpoints (profile, interests, messages,
│   │                                        # safety/block, safety/report, waitlist, payments, admin)
│   ├── components/                          # Reusable accessible UI & feature components
│   ├── lib/
│   │   ├── peace-score/index.ts             # Deterministic, explainable Peace Score engine
│   │   ├── discovery/                       # Server-side discovery filtering, ranking & loader
│   │   ├── matching/rules.ts                # Canonical user pair & conversation authorisation guards
│   │   ├── entitlements.ts                  # Freemium & Premium checks + HMAC-SHA256 verification
│   │   ├── validations/index.ts             # Zod schemas & XSS input sanitiser
│   │   ├── security/rate-limit.ts           # Server-side sliding window rate limiter
│   │   └── supabase/                        # Browser, Server, and Server-Only Admin clients
│   ├── types/database.ts                    # Complete TypeScript domain & database definitions
│   └── __tests__/                           # Vitest unit, integration, and SQL/RLS audit suites
└── e2e/
    └── spacesync.spec.ts                    # Playwright desktop & mobile E2E tests
```

---

## Required External Configuration (`.env.local`)

Copy `.env.example` to `.env.local` and supply real credentials. See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for step-by-step instructions.

| Variable | Scope | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public | Base URL of the application (`http://localhost:3000` in dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL (Required for Auth, DB, Storage, Realtime) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase publishable `anon` key (enforces RLS policies) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only | Privileged key used strictly on server for account deletion & verified webhooks |
| `SPACESYNC_ADMIN_EMAILS` | Server-Only | Comma-separated verified emails authorised to access `/admin` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public | Optional — Razorpay key ID for ₹199/month Premium checkout |
| `RAZORPAY_KEY_SECRET` | Server-Only | Optional — Razorpay secret for order creation & HMAC-SHA256 verification |
| `RAZORPAY_WEBHOOK_SECRET` | Server-Only | Optional — Razorpay webhook signing secret for idempotent event processing |

### Known Limitations When External Credentials Are Unconfigured
- **Without Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)**: The public website, Peace Score engine, validation schemas, and honest empty states run normally, and a clear `ConfigStatusBanner` lists the exact missing environment variables. Live sign-up, login, onboarding persistence, waitlist writes, and messaging require a connected Supabase project.
- **Without Razorpay credentials (`NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`)**: The Pricing page displays an explicit billing configuration notice and refuses to simulate payment upgrades.

---

## Local Development & Verification

```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript type checking
npm run typecheck

# 3. Run ESLint
npm run lint

# 4. Run Unit & Integration Tests (Vitest)
npm test

# 5. Build for Production
npm run build

# 6. Start Development Server
npm run dev
```

---

## Deployment (Vercel)

1. Push this repository to GitHub (`https://github.com/purohitshivam/thespacesync`).
2. Import the repository into [Vercel](https://vercel.com/new).
3. Configure the environment variables listed in `.env.example` inside **Vercel Project Settings → Environment Variables**.
4. Deploy. `vercel.json` automatically configures security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
