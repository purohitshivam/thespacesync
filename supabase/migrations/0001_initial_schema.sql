-- ============================================================================
-- SPACESYNC — VERSIONED MIGRATION 0001: CORE RELATIONAL SCHEMA
-- Zero dummy data. All records originate from real authenticated users.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. CUSTOM ENUM TYPES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE account_status_type AS ENUM ('active', 'suspended', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE search_intent_type AS ENUM ('looking_for_flatmate', 'have_shared_space', 'exploring_both');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE importance_level_type AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE interest_status_type AS ENUM ('pending', 'accepted', 'declined', 'passed', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE match_status_type AS ENUM ('active', 'unmatched', 'blocked', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE report_reason_type AS ENUM (
    'harassment_or_abuse',
    'fake_or_misleading_profile',
    'spam_or_commercial_solicitation',
    'inappropriate_content',
    'discrimination_or_hate_speech',
    'off_platform_scam_attempt',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE report_status_type AS ENUM ('open', 'in_review', 'resolved_action_taken', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier_type AS ENUM ('free', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status_type AS ENUM ('active', 'past_due', 'cancelled', 'expired', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'interest_received',
    'mutual_match',
    'new_message',
    'subscription_updated',
    'moderation_notice',
    'system'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 2. UPDATED_AT TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. PROFILES TABLE
-- Stores identity, eligibility, city, and onboarding/publication status.
-- Creating an account never auto-publishes a profile (is_published = false).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  age_confirmed_18_plus BOOLEAN NOT NULL DEFAULT FALSE,
  birth_year INTEGER CHECK (birth_year IS NULL OR (birth_year >= 1925 AND birth_year <= (EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - 18))),
  avatar_url TEXT,
  bio TEXT DEFAULT '' CHECK (char_length(bio) <= 600),
  occupation_title TEXT DEFAULT '' CHECK (char_length(occupation_title) <= 120),
  occupation_category TEXT CHECK (occupation_category IN ('student', 'mba_student', 'working_professional', 'founder_freelancer', 'relocating', 'other')),
  institution_or_company TEXT DEFAULT '' CHECK (char_length(institution_or_company) <= 120),
  city TEXT NOT NULL DEFAULT '',
  search_intent search_intent_type NOT NULL DEFAULT 'looking_for_flatmate',
  onboarding_step INTEGER NOT NULL DEFAULT 1 CHECK (onboarding_step >= 1 AND onboarding_step <= 6),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  account_status account_status_type NOT NULL DEFAULT 'active',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT published_requires_completed_and_age CHECK (
    is_published = FALSE OR (onboarding_completed = TRUE AND age_confirmed_18_plus = TRUE AND char_length(trim(first_name)) > 0 AND char_length(trim(city)) > 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_profiles_discovery
  ON public.profiles (city, is_published, account_status)
  WHERE is_published = TRUE AND account_status = 'active';

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 4. LIFESTYLE PREFERENCES TABLE (40% Default Weight in Peace Score)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lifestyle_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  sleep_schedule TEXT CHECK (sleep_schedule IN ('early_bird', 'balanced', 'night_owl', 'flexible_shift')),
  cleanliness_level TEXT CHECK (cleanliness_level IN ('spotless', 'tidy_shared_spaces', 'relaxed', 'weekly_deep_clean')),
  cooking_habits TEXT CHECK (cooking_habits IN ('daily_cook', 'occasional_cook', 'mostly_order_in', 'meal_prep_weekends')),
  dietary_preference TEXT CHECK (dietary_preference IN ('strict_veg_kitchen', 'veg_preferred_flexible', 'non_veg_comfortable', 'vegan')),
  smoking_preference TEXT CHECK (smoking_preference IN ('never', 'outside_only', 'occasionally_indoors', 'tolerant')),
  guests_overnight TEXT CHECK (guests_overnight IN ('rarely', 'occasional_with_notice', 'weekends_welcome', 'anytime_open')),
  noise_tolerance TEXT CHECK (noise_tolerance IN ('quiet_sanctuary', 'moderate_daytime', 'lively_music_friendly')),
  socialising_at_home TEXT CHECK (socialising_at_home IN ('quiet_retreat', 'small_dinners_boardgames', 'frequent_gatherings')),
  work_study_routine TEXT CHECK (work_study_routine IN ('mostly_office_campus', 'hybrid', 'mostly_from_home', 'late_study_hours')),
  pet_preference TEXT CHECK (pet_preference IN ('no_pets', 'have_pets', 'love_pets_dont_own', 'allergic')),
  chore_arrangement TEXT CHECK (chore_arrangement IN ('shared_roster', 'hired_househelp', 'clean_as_you_go', 'flexible')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_lifestyle_preferences_updated_at
  BEFORE UPDATE ON public.lifestyle_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. PERSONALITY & COMMUNICATION PREFERENCES TABLE (20% Default Weight)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personality_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  social_interaction_level TEXT CHECK (social_interaction_level IN ('mostly_independent', 'friendly_checkins', 'hangout_regularly', 'close_friends_vibe')),
  energy_orientation TEXT CHECK (energy_orientation IN ('recharge_alone', 'ambivert_balanced', 'energised_by_company')),
  communication_style TEXT CHECK (communication_style IN ('direct_and_immediate', 'gentle_in_person', 'async_message_first', 'scheduled_house_sync')),
  conflict_resolution TEXT CHECK (conflict_resolution IN ('address_early_calmly', 'cool_off_then_talk', 'written_note_first', 'compromise_focused')),
  home_atmosphere TEXT CHECK (home_atmosphere IN ('calm_minimalist', 'warm_cozy_shared', 'creative_bustling', 'structured_academic')),
  shared_vs_independent_time TEXT CHECK (shared_vs_independent_time IN ('80_independent_20_shared', '50_50_balanced', '30_independent_70_shared')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_personality_preferences_updated_at
  BEFORE UPDATE ON public.personality_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. LIVING PREFERENCES TABLE (40% Default Weight in Peace Score)
-- Avoids duplicating city/search_intent from profiles; stores budget, areas, timeline.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.living_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  budget_min_inr INTEGER CHECK (budget_min_inr IS NULL OR (budget_min_inr >= 2000 AND budget_min_inr <= 250000)),
  budget_max_inr INTEGER CHECK (budget_max_inr IS NULL OR (budget_max_inr >= 2000 AND budget_max_inr <= 300000)),
  preferred_areas TEXT[] NOT NULL DEFAULT '{}',
  moving_timeline TEXT CHECK (moving_timeline IN ('immediate', 'within_1_month', '1_to_3_months', 'flexible_3_plus_months')),
  living_arrangement TEXT CHECK (living_arrangement IN ('private_room_2bhk', 'private_room_3bhk', 'shared_room', 'studio_coliving', 'flexible')),
  household_boundaries TEXT[] NOT NULL DEFAULT '{}',
  non_negotiables TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_budget_range CHECK (
    budget_min_inr IS NULL OR budget_max_inr IS NULL OR budget_min_inr <= budget_max_inr
  )
);

CREATE INDEX IF NOT EXISTS idx_living_preferences_timeline
  ON public.living_preferences (moving_timeline);

CREATE INDEX IF NOT EXISTS idx_living_preferences_budget
  ON public.living_preferences (budget_min_inr, budget_max_inr);

CREATE TRIGGER trg_living_preferences_updated_at
  BEFORE UPDATE ON public.living_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 7. PREFERENCE IMPORTANCE TABLE
-- Stores per-question importance ('low', 'medium', 'high') and deal-breaker flag.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.preference_importance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL CHECK (char_length(question_key) > 0 AND char_length(question_key) <= 64),
  importance importance_level_type NOT NULL DEFAULT 'medium',
  is_dealbreaker BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, question_key)
);

CREATE INDEX IF NOT EXISTS idx_preference_importance_user
  ON public.preference_importance (user_id);

CREATE TRIGGER trg_preference_importance_updated_at
  BEFORE UPDATE ON public.preference_importance
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 8. PRIVACY PREFERENCES TABLE
-- Contact details remain private by default.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.privacy_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  discoverable_in_search BOOLEAN NOT NULL DEFAULT TRUE,
  show_institution_or_company BOOLEAN NOT NULL DEFAULT TRUE,
  show_exact_neighborhoods BOOLEAN NOT NULL DEFAULT TRUE,
  share_contact_with_matches BOOLEAN NOT NULL DEFAULT FALSE,
  contact_phone_or_handle TEXT DEFAULT '' CHECK (char_length(contact_phone_or_handle) <= 100),
  notify_new_interests BOOLEAN NOT NULL DEFAULT TRUE,
  notify_mutual_matches BOOLEAN NOT NULL DEFAULT TRUE,
  notify_messages BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_privacy_preferences_updated_at
  BEFORE UPDATE ON public.privacy_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 9. USER BLOCKS TABLE
-- Enforces bidirectional contact & discovery blocks.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT DEFAULT '' CHECK (char_length(reason) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_block CHECK (blocker_id <> blocked_id),
  UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks (blocked_id);

-- ----------------------------------------------------------------------------
-- 10. INTERESTS TABLE
-- Tracks expressed interest or passes between two distinct profiles.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status interest_status_type NOT NULL DEFAULT 'pending',
  intro_note TEXT DEFAULT '' CHECK (char_length(intro_note) <= 280),
  peace_score_snapshot INTEGER CHECK (peace_score_snapshot IS NULL OR (peace_score_snapshot >= 0 AND peace_score_snapshot <= 100)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_interest CHECK (sender_id <> receiver_id),
  UNIQUE (sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_interests_sender ON public.interests (sender_id, status);
CREATE INDEX IF NOT EXISTS idx_interests_receiver ON public.interests (receiver_id, status);

CREATE TRIGGER trg_interests_updated_at
  BEFORE UPDATE ON public.interests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 11. MATCHES TABLE
-- Canonical user pair representation: user_one_id < user_two_id prevents duplicates.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_one_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_two_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status match_status_type NOT NULL DEFAULT 'active',
  peace_score_at_match INTEGER CHECK (peace_score_at_match IS NULL OR (peace_score_at_match >= 0 AND peace_score_at_match <= 100)),
  matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT canonical_match_pair_order CHECK (user_one_id < user_two_id),
  UNIQUE (user_one_id, user_two_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user_one ON public.matches (user_one_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_user_two ON public.matches (user_two_id, status);

CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 12. CONVERSATIONS TABLE
-- One conversation per mutual match.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL UNIQUE REFERENCES public.matches(id) ON DELETE CASCADE,
  user_one_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_two_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT DEFAULT '' CHECK (char_length(last_message_preview) <= 160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT canonical_conversation_pair_order CHECK (user_one_id < user_two_id),
  UNIQUE (user_one_id, user_two_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_one ON public.conversations (user_one_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_two ON public.conversations (user_two_id, last_message_at DESC);

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 13. MESSAGES TABLE
-- Persistent 1-to-1 messages within an authorised conversation.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(trim(body)) >= 1 AND char_length(body) <= 2000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON public.messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON public.messages (conversation_id, sender_id)
  WHERE read_at IS NULL;

-- ----------------------------------------------------------------------------
-- 14. REPORTS TABLE
-- Private to the reporter (insert) and authorised admins/moderators.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  reason report_reason_type NOT NULL,
  description TEXT DEFAULT '' CHECK (char_length(description) <= 1000),
  status report_status_type NOT NULL DEFAULT 'open',
  moderator_notes TEXT DEFAULT '' CHECK (char_length(moderator_notes) <= 1000),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_report CHECK (reporter_id <> reported_user_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON public.reports (reported_user_id);

CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 15. MODERATION AUDIT LOG TABLE
-- Immutable audit trail of admin actions (report review, user suspension/reactivation).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moderation_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (char_length(action_type) <= 80),
  notes TEXT DEFAULT '' CHECK (char_length(notes) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_audit_created
  ON public.moderation_audit_log (created_at DESC);

-- ----------------------------------------------------------------------------
-- 16. SUBSCRIPTIONS TABLE
-- Tracks Free vs Premium (₹199/month) entitlements. Read-only to regular users.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier subscription_tier_type NOT NULL DEFAULT 'free',
  status subscription_status_type NOT NULL DEFAULT 'active',
  price_inr INTEGER NOT NULL DEFAULT 0 CHECK (price_inr >= 0),
  provider TEXT DEFAULT 'razorpay',
  provider_order_id TEXT,
  provider_payment_id TEXT UNIQUE,
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_tier
  ON public.subscriptions (user_id, tier, status);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 17. NOTIFICATIONS TABLE
-- Persistent in-app notifications for interests, matches, messages, and events.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) <= 140),
  body TEXT NOT NULL DEFAULT '' CHECK (char_length(body) <= 500),
  action_url TEXT DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, is_read, created_at DESC);

-- ----------------------------------------------------------------------------
-- 18. WAITLIST ENTRIES TABLE
-- Minimal launch waitlist with email uniqueness (case-insensitive) and consent.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL CHECK (char_length(trim(email)) >= 5 AND char_length(email) <= 254),
  intended_city TEXT NOT NULL CHECK (char_length(trim(intended_city)) >= 2 AND char_length(intended_city) <= 80),
  moving_timeline TEXT CHECK (moving_timeline IS NULL OR moving_timeline IN ('immediate', 'within_1_month', '1_to_3_months', 'flexible_3_plus_months')),
  consent_communications BOOLEAN NOT NULL DEFAULT FALSE CHECK (consent_communications = TRUE),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_entries_email_lower
  ON public.waitlist_entries (LOWER(TRIM(email)));
