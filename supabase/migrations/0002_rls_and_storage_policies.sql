-- ============================================================================
-- SPACESYNC — VERSIONED MIGRATION 0002: ROW LEVEL SECURITY, RPCs & STORAGE
-- Enforces strict authorisation, block/suspension checks, and atomic matching.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. AUTOMATIC AUTH.USERS ONBOARDING INITIALIZATION TRIGGER
-- Creates an unpublished profile shell (is_published = false) on signup.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    is_email_verified,
    is_published,
    onboarding_completed,
    onboarding_step
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    (NEW.email_confirmed_at IS NOT NULL),
    FALSE,
    FALSE,
    1
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.lifestyle_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.personality_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.living_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.privacy_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, tier, status, price_inr)
  VALUES (NEW.id, 'free', 'active', 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Sync email verification status when auth.users is updated
CREATE OR REPLACE FUNCTION public.handle_auth_user_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET is_email_verified = TRUE, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_verified();

-- ----------------------------------------------------------------------------
-- 2. SECURITY HELPER FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_active_user(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = check_user_id
      AND account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = check_user_id
      AND is_admin = TRUE
      AND account_status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_blocked_between(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_blocks
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_discoverable_profile(target_user_id UUID, viewer_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    LEFT JOIN public.privacy_preferences pp ON pp.user_id = p.id
    WHERE p.id = target_user_id
      AND p.is_published = TRUE
      AND p.onboarding_completed = TRUE
      AND p.age_confirmed_18_plus = TRUE
      AND p.account_status = 'active'
      AND COALESCE(pp.discoverable_in_search, TRUE) = TRUE
      AND NOT public.is_blocked_between(target_user_id, viewer_user_id)
  );
$$;

CREATE OR REPLACE FUNCTION public.are_active_matched(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.matches m
    WHERE m.user_one_id = LEAST(user_a, user_b)
      AND m.user_two_id = GREATEST(user_a, user_b)
      AND m.status = 'active'
      AND NOT public.is_blocked_between(user_a, user_b)
      AND public.is_active_user(user_a)
      AND public.is_active_user(user_b)
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifestyle_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.living_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preference_importance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4. RLS POLICIES: PROFILES & PREFERENCES
-- ----------------------------------------------------------------------------

-- PROFILES: Own profile, Admin, or Published/Eligible & Unblocked
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.is_admin_user(auth.uid())
    OR (
      public.is_active_user(auth.uid())
      AND public.is_discoverable_profile(id, auth.uid())
    )
  );

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND is_admin = FALSE
    AND account_status = 'active'
  );

-- Prevent regular users from escalating is_admin or changing account_status to bypass suspension
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() AND account_status = 'active')
  WITH CHECK (
    id = auth.uid()
    AND account_status = 'active'
    AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY "profiles_admin_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- LIFESTYLE PREFERENCES
CREATE POLICY "lifestyle_select_policy"
  ON public.lifestyle_preferences FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user(auth.uid())
    OR (public.is_active_user(auth.uid()) AND public.is_discoverable_profile(user_id, auth.uid()))
  );

CREATE POLICY "lifestyle_insert_own"
  ON public.lifestyle_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_active_user(auth.uid()));

CREATE POLICY "lifestyle_update_own"
  ON public.lifestyle_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND public.is_active_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND public.is_active_user(auth.uid()));

-- PERSONALITY PREFERENCES
CREATE POLICY "personality_select_policy"
  ON public.personality_preferences FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user(auth.uid())
    OR (public.is_active_user(auth.uid()) AND public.is_discoverable_profile(user_id, auth.uid()))
  );

CREATE POLICY "personality_insert_own"
  ON public.personality_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_active_user(auth.uid()));

CREATE POLICY "personality_update_own"
  ON public.personality_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND public.is_active_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND public.is_active_user(auth.uid()));

-- LIVING PREFERENCES
CREATE POLICY "living_select_policy"
  ON public.living_preferences FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user(auth.uid())
    OR (public.is_active_user(auth.uid()) AND public.is_discoverable_profile(user_id, auth.uid()))
  );

CREATE POLICY "living_insert_own"
  ON public.living_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_active_user(auth.uid()));

CREATE POLICY "living_update_own"
  ON public.living_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND public.is_active_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND public.is_active_user(auth.uid()));

-- PREFERENCE IMPORTANCE
CREATE POLICY "importance_select_policy"
  ON public.preference_importance FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user(auth.uid())
    OR (public.is_active_user(auth.uid()) AND public.is_discoverable_profile(user_id, auth.uid()))
  );

CREATE POLICY "importance_insert_own"
  ON public.preference_importance FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_active_user(auth.uid()));

CREATE POLICY "importance_update_own"
  ON public.preference_importance FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND public.is_active_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND public.is_active_user(auth.uid()));

CREATE POLICY "importance_delete_own"
  ON public.preference_importance FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND public.is_active_user(auth.uid()));

-- PRIVACY PREFERENCES: Contact details are NEVER publicly exposed.
-- Only the owner, or an active match when share_contact_with_matches = true, can read row.
CREATE POLICY "privacy_select_own_or_authorised_match"
  ON public.privacy_preferences FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin_user(auth.uid())
    OR (
      share_contact_with_matches = TRUE
      AND public.are_active_matched(auth.uid(), user_id)
    )
  );

CREATE POLICY "privacy_insert_own"
  ON public.privacy_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_active_user(auth.uid()));

CREATE POLICY "privacy_update_own"
  ON public.privacy_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND public.is_active_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND public.is_active_user(auth.uid()));

-- ----------------------------------------------------------------------------
-- 5. RLS POLICIES: USER BLOCKS & REPORTS
-- ----------------------------------------------------------------------------
CREATE POLICY "blocks_select_own"
  ON public.user_blocks FOR SELECT
  TO authenticated
  USING (blocker_id = auth.uid() OR public.is_admin_user(auth.uid()));

CREATE POLICY "blocks_insert_own"
  ON public.user_blocks FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = auth.uid() AND blocker_id <> blocked_id);

CREATE POLICY "blocks_delete_own"
  ON public.user_blocks FOR DELETE
  TO authenticated
  USING (blocker_id = auth.uid());

-- REPORTS: Only reporter can insert; only admins can view all and update moderation status.
CREATE POLICY "reports_insert_authenticated"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = auth.uid()
    AND reporter_id <> reported_user_id
    AND public.is_active_user(auth.uid())
  );

CREATE POLICY "reports_select_own_or_admin"
  ON public.reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid() OR public.is_admin_user(auth.uid()));

CREATE POLICY "reports_update_admin_only"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- MODERATION AUDIT LOG: Admin only
CREATE POLICY "audit_log_select_admin"
  ON public.moderation_audit_log FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "audit_log_insert_admin"
  ON public.moderation_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()) AND admin_user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 6. RLS POLICIES: INTERESTS, MATCHES, CONVERSATIONS & MESSAGES
-- ----------------------------------------------------------------------------

-- INTERESTS: Visible to sender or receiver when unblocked and active
CREATE POLICY "interests_select_participants"
  ON public.interests FOR SELECT
  TO authenticated
  USING (
    public.is_admin_user(auth.uid())
    OR (
      (sender_id = auth.uid() OR receiver_id = auth.uid())
      AND NOT public.is_blocked_between(sender_id, receiver_id)
    )
  );

CREATE POLICY "interests_insert_sender"
  ON public.interests FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_id <> receiver_id
    AND public.is_active_user(auth.uid())
    AND public.is_discoverable_profile(receiver_id, auth.uid())
    AND NOT public.is_blocked_between(sender_id, receiver_id)
  );

CREATE POLICY "interests_update_participants"
  ON public.interests FOR UPDATE
  TO authenticated
  USING (
    (sender_id = auth.uid() OR receiver_id = auth.uid())
    AND public.is_active_user(auth.uid())
    AND NOT public.is_blocked_between(sender_id, receiver_id)
  )
  WITH CHECK (
    (sender_id = auth.uid() OR receiver_id = auth.uid())
    AND public.is_active_user(auth.uid())
    AND NOT public.is_blocked_between(sender_id, receiver_id)
  );

-- MATCHES: Users CANNOT insert matches directly! Matches are created only via verified
-- mutual interest in public.express_interest_transaction().
CREATE POLICY "matches_select_participants"
  ON public.matches FOR SELECT
  TO authenticated
  USING (
    public.is_admin_user(auth.uid())
    OR (
      (user_one_id = auth.uid() OR user_two_id = auth.uid())
      AND NOT public.is_blocked_between(user_one_id, user_two_id)
    )
  );

-- CONVERSATIONS: Only active match participants can view conversations.
CREATE POLICY "conversations_select_participants"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    public.is_admin_user(auth.uid())
    OR (
      (user_one_id = auth.uid() OR user_two_id = auth.uid())
      AND public.are_active_matched(user_one_id, user_two_id)
    )
  );

-- MESSAGES: Only active matched conversation participants can read and send messages.
CREATE POLICY "messages_select_participants"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_one_id = auth.uid() OR c.user_two_id = auth.uid())
        AND public.are_active_matched(c.user_one_id, c.user_two_id)
    )
  );

CREATE POLICY "messages_insert_participants"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_active_user(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_one_id = auth.uid() OR c.user_two_id = auth.uid())
        AND public.are_active_matched(c.user_one_id, c.user_two_id)
    )
  );

CREATE POLICY "messages_update_read_receipt"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user_one_id = auth.uid() OR c.user_two_id = auth.uid())
        AND public.are_active_matched(c.user_one_id, c.user_two_id)
    )
  )
  WITH CHECK (
    sender_id <> auth.uid()
  );

-- ----------------------------------------------------------------------------
-- 7. RLS POLICIES: SUBSCRIPTIONS, NOTIFICATIONS & WAITLIST
-- ----------------------------------------------------------------------------

-- SUBSCRIPTIONS: Read-only to owner and admins. Regular users cannot modify entitlements!
CREATE POLICY "subscriptions_select_own_or_admin"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin_user(auth.uid()));

-- NOTIFICATIONS: Read and mark-as-read by owner only
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- WAITLIST ENTRIES: Anyone can insert a valid waitlist entry; only admins can read list
CREATE POLICY "waitlist_insert_public"
  ON public.waitlist_entries FOR INSERT
  TO anon, authenticated
  WITH CHECK (consent_communications = TRUE AND char_length(trim(email)) >= 5);

CREATE POLICY "waitlist_select_admin"
  ON public.waitlist_entries FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- ----------------------------------------------------------------------------
-- 8. TRANSACTIONAL RPC FUNCTIONS FOR ATOMIC MATCHING & BLOCKING
-- Prevents race conditions and arbitrary match creation.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.express_interest_transaction(
  p_target_user_id UUID,
  p_action TEXT,
  p_intro_note TEXT DEFAULT '',
  p_peace_score INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_reverse_interest RECORD;
  v_match_id UUID;
  v_conversation_id UUID;
  v_u1 UUID;
  v_u2 UUID;
  v_actor_name TEXT;
  v_target_name TEXT;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF v_actor_id = p_target_user_id THEN
    RAISE EXCEPTION 'Cannot express interest in your own profile';
  END IF;

  IF NOT public.is_active_user(v_actor_id) THEN
    RAISE EXCEPTION 'Your account is not active';
  END IF;

  IF public.is_blocked_between(v_actor_id, p_target_user_id) THEN
    RAISE EXCEPTION 'Action not permitted between these profiles';
  END IF;

  IF NOT public.is_discoverable_profile(p_target_user_id, v_actor_id) THEN
    RAISE EXCEPTION 'Target profile is not eligible for matching';
  END IF;

  SELECT first_name INTO v_actor_name FROM public.profiles WHERE id = v_actor_id;
  SELECT first_name INTO v_target_name FROM public.profiles WHERE id = p_target_user_id;

  IF p_action = 'pass' THEN
    INSERT INTO public.interests (sender_id, receiver_id, status, intro_note, peace_score_snapshot)
    VALUES (v_actor_id, p_target_user_id, 'passed', '', p_peace_score)
    ON CONFLICT (sender_id, receiver_id)
    DO UPDATE SET status = 'passed', updated_at = NOW();

    RETURN jsonb_build_object('status', 'passed', 'matched', FALSE);
  END IF;

  IF p_action = 'withdraw' THEN
    UPDATE public.interests
    SET status = 'withdrawn', updated_at = NOW()
    WHERE sender_id = v_actor_id AND receiver_id = p_target_user_id AND status = 'pending';

    RETURN jsonb_build_object('status', 'withdrawn', 'matched', FALSE);
  END IF;

  IF p_action = 'decline' THEN
    UPDATE public.interests
    SET status = 'declined', updated_at = NOW()
    WHERE sender_id = p_target_user_id AND receiver_id = v_actor_id AND status = 'pending';

    RETURN jsonb_build_object('status', 'declined', 'matched', FALSE);
  END IF;

  -- Check if target user already has a pending or accepted interest toward actor
  SELECT * INTO v_reverse_interest
  FROM public.interests
  WHERE sender_id = p_target_user_id
    AND receiver_id = v_actor_id
    AND status IN ('pending', 'accepted')
  FOR UPDATE;

  IF FOUND THEN
    -- Mutual interest! Mark both interests as accepted and create canonical match + conversation
    UPDATE public.interests
    SET status = 'accepted', updated_at = NOW()
    WHERE id = v_reverse_interest.id;

    INSERT INTO public.interests (sender_id, receiver_id, status, intro_note, peace_score_snapshot)
    VALUES (v_actor_id, p_target_user_id, 'accepted', COALESCE(p_intro_note, ''), p_peace_score)
    ON CONFLICT (sender_id, receiver_id)
    DO UPDATE SET status = 'accepted', intro_note = COALESCE(EXCLUDED.intro_note, interests.intro_note), updated_at = NOW();

    v_u1 := LEAST(v_actor_id, p_target_user_id);
    v_u2 := GREATEST(v_actor_id, p_target_user_id);

    INSERT INTO public.matches (user_one_id, user_two_id, status, peace_score_at_match)
    VALUES (v_u1, v_u2, 'active', COALESCE(p_peace_score, v_reverse_interest.peace_score_snapshot))
    ON CONFLICT (user_one_id, user_two_id)
    DO UPDATE SET status = 'active', updated_at = NOW()
    RETURNING id INTO v_match_id;

    INSERT INTO public.conversations (match_id, user_one_id, user_two_id)
    VALUES (v_match_id, v_u1, v_u2)
    ON CONFLICT (user_one_id, user_two_id)
    DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_conversation_id;

    -- Notify both users of the mutual match
    INSERT INTO public.notifications (user_id, type, title, body, action_url)
    VALUES
      (
        p_target_user_id,
        'mutual_match',
        'New mutual match with ' || COALESCE(NULLIF(v_actor_name, ''), 'a flatmate'),
        'You both expressed interest. Start a conversation to discuss living preferences.',
        '/messages/' || v_conversation_id::text
      ),
      (
        v_actor_id,
        'mutual_match',
        'New mutual match with ' || COALESCE(NULLIF(v_target_name, ''), 'a flatmate'),
        'You both expressed interest. Start a conversation to discuss living preferences.',
        '/messages/' || v_conversation_id::text
      );

    RETURN jsonb_build_object(
      'status', 'accepted',
      'matched', TRUE,
      'match_id', v_match_id,
      'conversation_id', v_conversation_id
    );
  ELSE
    -- One-way interest: save as pending and notify recipient
    INSERT INTO public.interests (sender_id, receiver_id, status, intro_note, peace_score_snapshot)
    VALUES (v_actor_id, p_target_user_id, 'pending', COALESCE(p_intro_note, ''), p_peace_score)
    ON CONFLICT (sender_id, receiver_id)
    DO UPDATE SET
      status = 'pending',
      intro_note = COALESCE(EXCLUDED.intro_note, interests.intro_note),
      peace_score_snapshot = COALESCE(EXCLUDED.peace_score_snapshot, interests.peace_score_snapshot),
      updated_at = NOW();

    INSERT INTO public.notifications (user_id, type, title, body, action_url)
    VALUES (
      p_target_user_id,
      'interest_received',
      COALESCE(NULLIF(v_actor_name, ''), 'Someone') || ' expressed interest in flatsharing',
      'Review their Peace Score breakdown and respond in Connections.',
      '/connections'
    );

    RETURN jsonb_build_object('status', 'pending', 'matched', FALSE);
  END IF;
END;
$$;

-- Transactional user block function: blocks user and deactivates any existing match/interests
CREATE OR REPLACE FUNCTION public.block_user_transaction(
  p_blocked_user_id UUID,
  p_reason TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_u1 UUID;
  v_u2 UUID;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF v_actor_id = p_blocked_user_id THEN
    RAISE EXCEPTION 'Cannot block yourself';
  END IF;

  INSERT INTO public.user_blocks (blocker_id, blocked_id, reason)
  VALUES (v_actor_id, p_blocked_user_id, COALESCE(p_reason, ''))
  ON CONFLICT (blocker_id, blocked_id) DO NOTHING;

  UPDATE public.interests
  SET status = 'withdrawn', updated_at = NOW()
  WHERE (sender_id = v_actor_id AND receiver_id = p_blocked_user_id)
     OR (sender_id = p_blocked_user_id AND receiver_id = v_actor_id);

  v_u1 := LEAST(v_actor_id, p_blocked_user_id);
  v_u2 := GREATEST(v_actor_id, p_blocked_user_id);

  UPDATE public.matches
  SET status = 'blocked', updated_at = NOW()
  WHERE user_one_id = v_u1 AND user_two_id = v_u2;

  RETURN jsonb_build_object('blocked', TRUE);
END;
$$;

-- Trigger to update conversation preview and create notification on new message
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv RECORD;
  v_recipient_id UUID;
  v_sender_name TEXT;
BEGIN
  SELECT * INTO v_conv FROM public.conversations WHERE id = NEW.conversation_id;
  IF FOUND THEN
    UPDATE public.conversations
    SET
      last_message_at = NEW.created_at,
      last_message_preview = LEFT(NEW.body, 150),
      updated_at = NOW()
    WHERE id = NEW.conversation_id;

    IF v_conv.user_one_id = NEW.sender_id THEN
      v_recipient_id := v_conv.user_two_id;
    ELSE
      v_recipient_id := v_conv.user_one_id;
    END IF;

    SELECT first_name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

    INSERT INTO public.notifications (user_id, type, title, body, action_url)
    VALUES (
      v_recipient_id,
      'new_message',
      'New message from ' || COALESCE(NULLIF(v_sender_name, ''), 'your match'),
      LEFT(NEW.body, 120),
      '/messages/' || NEW.conversation_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_new_message ON public.messages;
CREATE TRIGGER trg_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- ----------------------------------------------------------------------------
-- 9. SUPABASE STORAGE BUCKET & POLICIES FOR PROFILE PHOTOS
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  TRUE,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "profile_photos_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_authenticated_upload_own_folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_photos_authenticated_update_own_folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_photos_authenticated_delete_own_folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
