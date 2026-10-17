# SpaceSync — Supabase Setup & Database Migration Guide

This guide explains how to connect SpaceSync to a live Supabase project (Auth, PostgreSQL, Row Level Security, Storage, and Realtime).

> **Important Security & Honesty Note:**
> SpaceSync never substitutes mock data or simulated authentication when Supabase credentials are missing. Until the variables below are configured in `.env.local` (or your Vercel deployment environment), authentication, waitlist writes, and profile persistence will honestly report that configuration is pending.

---

## 1. Create a Supabase Project

1. Sign in to [https://supabase.com/dashboard](https://supabase.com/dashboard) and click **New Project**.
2. Choose a region close to your initial audience (e.g., **South Asia (Mumbai) `ap-south-1`**).
3. Save your database password securely.

---

## 2. Copy Your API Credentials

1. In your Supabase Dashboard, navigate to **Project Settings → API**.
2. Copy `.env.example` to `.env.local` in the root of this repository:
   ```bash
   cp .env.example .env.local
   ```
3. Populate the following variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Project URL (e.g., `https://xyzcompany.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your `anon` / `public` publishable key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your `service_role` secret key (**Server-only** — used exclusively on the server for permanent account deletion and verified Razorpay webhook subscription updates; never exposed to the browser).

---

## 3. Run the Versioned SQL Migrations

SpaceSync includes two versioned, idempotent SQL migration files in `supabase/migrations/`:

1. [`supabase/migrations/0001_initial_schema.sql`](./supabase/migrations/0001_initial_schema.sql)
   - Creates all 16 relational tables (`profiles`, `lifestyle_preferences`, `personality_preferences`, `living_preferences`, `preference_importance`, `privacy_preferences`, `user_blocks`, `interests`, `matches`, `conversations`, `messages`, `reports`, `moderation_audit_log`, `subscriptions`, `notifications`, `waitlist_entries`).
   - Enforces canonical user-pair ordering (`CHECK (user_one_id < user_two_id)`), uniqueness constraints, and `is_published = FALSE` default on profile creation.
2. [`supabase/migrations/0002_rls_and_storage_policies.sql`](./supabase/migrations/0002_rls_and_storage_policies.sql)
   - Enables Row Level Security (RLS) on all 16 tables.
   - Creates `on_auth_user_created` and `on_auth_user_verified` triggers on `auth.users`.
   - Creates atomic transactional RPCs: `public.express_interest_transaction(...)` and `public.block_user_transaction(...)`.
   - Creates the `profile-photos` storage bucket and folder-scoped RLS policies (`(storage.foldername(name))[1] = auth.uid()::text`).

### Option A: Using the Supabase SQL Editor
1. Open **SQL Editor** in your Supabase Dashboard.
2. Paste and run the contents of `supabase/migrations/0001_initial_schema.sql`.
3. Paste and run the contents of `supabase/migrations/0002_rls_and_storage_policies.sql`.

### Option B: Using the Supabase CLI
```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

---

## 4. Configure Authentication Redirect URLs

1. In the Supabase Dashboard, navigate to **Authentication → URL Configuration**.
2. Set **Site URL** to:
   - Local development: `http://localhost:3000`
   - Production: `https://your-production-domain.vercel.app`
3. Add the following to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**`
   - `https://your-production-domain.vercel.app/auth/callback`
   - `https://your-production-domain.vercel.app/**`

---

## 5. Enable Supabase Realtime for In-App Chat

1. Navigate to **Database → Publications** (or **Replication**) in your Supabase Dashboard.
2. Under the `supabase_realtime` publication, enable Realtime events (`INSERT`, `UPDATE`) for:
   - `public.messages`
   - `public.notifications`

---

## 6. Configure Administrator Access

To grant an account access to `/admin`:
1. Add your verified email address to `SPACESYNC_ADMIN_EMAILS` in `.env.local`, **and/or**
2. Run in the Supabase SQL Editor after registering your account:
   ```sql
   UPDATE public.profiles
   SET is_admin = TRUE
   WHERE id = '<your-auth-user-uuid>';
   ```
