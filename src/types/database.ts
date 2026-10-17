export type AccountStatus = "active" | "suspended" | "deleted";
export type SearchIntent = "looking_for_flatmate" | "have_shared_space" | "exploring_both";
export type ImportanceLevel = "low" | "medium" | "high";
export type InterestStatus = "pending" | "accepted" | "declined" | "passed" | "withdrawn";
export type MatchStatus = "active" | "unmatched" | "blocked" | "suspended";
export type SubscriptionTier = "free" | "premium";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "expired" | "pending";

export type ReportReason =
  | "harassment_or_abuse"
  | "fake_or_misleading_profile"
  | "spam_or_commercial_solicitation"
  | "inappropriate_content"
  | "discrimination_or_hate_speech"
  | "off_platform_scam_attempt"
  | "other";

export type ReportStatus = "open" | "in_review" | "resolved_action_taken" | "dismissed";

export type NotificationType =
  | "interest_received"
  | "mutual_match"
  | "new_message"
  | "subscription_updated"
  | "moderation_notice"
  | "system";

export type OccupationCategory =
  | "student"
  | "mba_student"
  | "working_professional"
  | "founder_freelancer"
  | "relocating"
  | "other";

export type SleepSchedule = "early_bird" | "balanced" | "night_owl" | "flexible_shift";
export type CleanlinessLevel = "spotless" | "tidy_shared_spaces" | "relaxed" | "weekly_deep_clean";
export type CookingHabits = "daily_cook" | "occasional_cook" | "mostly_order_in" | "meal_prep_weekends";
export type DietaryPreference = "strict_veg_kitchen" | "veg_preferred_flexible" | "non_veg_comfortable" | "vegan";
export type SmokingPreference = "never" | "outside_only" | "occasionally_indoors" | "tolerant";
export type GuestsOvernight = "rarely" | "occasional_with_notice" | "weekends_welcome" | "anytime_open";
export type NoiseTolerance = "quiet_sanctuary" | "moderate_daytime" | "lively_music_friendly";
export type SocialisingAtHome = "quiet_retreat" | "small_dinners_boardgames" | "frequent_gatherings";
export type WorkStudyRoutine = "mostly_office_campus" | "hybrid" | "mostly_from_home" | "late_study_hours";
export type PetPreference = "no_pets" | "have_pets" | "love_pets_dont_own" | "allergic";
export type ChoreArrangement = "shared_roster" | "hired_househelp" | "clean_as_you_go" | "flexible";

export type SocialInteractionLevel = "mostly_independent" | "friendly_checkins" | "hangout_regularly" | "close_friends_vibe";
export type EnergyOrientation = "recharge_alone" | "ambivert_balanced" | "energised_by_company";
export type CommunicationStyle = "direct_and_immediate" | "gentle_in_person" | "async_message_first" | "scheduled_house_sync";
export type ConflictResolution = "address_early_calmly" | "cool_off_then_talk" | "written_note_first" | "compromise_focused";
export type HomeAtmosphere = "calm_minimalist" | "warm_cozy_shared" | "creative_bustling" | "structured_academic";
export type SharedVsIndependentTime = "80_independent_20_shared" | "50_50_balanced" | "30_independent_70_shared";

export type MovingTimeline = "immediate" | "within_1_month" | "1_to_3_months" | "flexible_3_plus_months";
export type LivingArrangement = "private_room_2bhk" | "private_room_3bhk" | "shared_room" | "studio_coliving" | "flexible";

export interface ProfileRow {
  id: string;
  first_name: string;
  age_confirmed_18_plus: boolean;
  birth_year: number | null;
  avatar_url: string | null;
  bio: string;
  occupation_title: string;
  occupation_category: OccupationCategory | null;
  institution_or_company: string;
  city: string;
  search_intent: SearchIntent;
  onboarding_step: number;
  onboarding_completed: boolean;
  is_published: boolean;
  is_email_verified: boolean;
  account_status: AccountStatus;
  is_admin: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface LifestylePreferencesRow {
  user_id: string;
  sleep_schedule: SleepSchedule | null;
  cleanliness_level: CleanlinessLevel | null;
  cooking_habits: CookingHabits | null;
  dietary_preference: DietaryPreference | null;
  smoking_preference: SmokingPreference | null;
  guests_overnight: GuestsOvernight | null;
  noise_tolerance: NoiseTolerance | null;
  socialising_at_home: SocialisingAtHome | null;
  work_study_routine: WorkStudyRoutine | null;
  pet_preference: PetPreference | null;
  chore_arrangement: ChoreArrangement | null;
  created_at?: string;
  updated_at?: string;
}

export interface PersonalityPreferencesRow {
  user_id: string;
  social_interaction_level: SocialInteractionLevel | null;
  energy_orientation: EnergyOrientation | null;
  communication_style: CommunicationStyle | null;
  conflict_resolution: ConflictResolution | null;
  home_atmosphere: HomeAtmosphere | null;
  shared_vs_independent_time: SharedVsIndependentTime | null;
  created_at?: string;
  updated_at?: string;
}

export interface LivingPreferencesRow {
  user_id: string;
  budget_min_inr: number | null;
  budget_max_inr: number | null;
  preferred_areas: string[];
  moving_timeline: MovingTimeline | null;
  living_arrangement: LivingArrangement | null;
  household_boundaries: string[];
  non_negotiables: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PreferenceImportanceRow {
  id?: string;
  user_id: string;
  question_key: string;
  importance: ImportanceLevel;
  is_dealbreaker: boolean;
}

export interface PrivacyPreferencesRow {
  user_id: string;
  discoverable_in_search: boolean;
  show_institution_or_company: boolean;
  show_exact_neighborhoods: boolean;
  share_contact_with_matches: boolean;
  contact_phone_or_handle: string;
  notify_new_interests: boolean;
  notify_mutual_matches: boolean;
  notify_messages: boolean;
}

export interface FullUserProfile {
  profile: ProfileRow;
  lifestyle: LifestylePreferencesRow | null;
  personality: PersonalityPreferencesRow | null;
  living: LivingPreferencesRow | null;
  importance: PreferenceImportanceRow[];
  privacy?: PrivacyPreferencesRow | null;
}

export interface InterestRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: InterestStatus;
  intro_note: string;
  peace_score_snapshot: number | null;
  created_at: string;
  updated_at: string;
}

export interface MatchRow {
  id: string;
  user_one_id: string;
  user_two_id: string;
  status: MatchStatus;
  peace_score_at_match: number | null;
  matched_at: string;
  updated_at: string;
}

export interface ConversationRow {
  id: string;
  match_id: string;
  user_one_id: string;
  user_two_id: string;
  last_message_at: string | null;
  last_message_preview: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  price_inr: number;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  provider_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url: string;
  is_read: boolean;
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  conversation_id: string | null;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  moderator_notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaitlistEntryRow {
  id: string;
  email: string;
  intended_city: string;
  moving_timeline: MovingTimeline | null;
  consent_communications: boolean;
  created_at: string;
}

export interface ModerationAuditLogRow {
  id: string;
  admin_user_id: string;
  target_user_id: string | null;
  report_id: string | null;
  action_type: string;
  notes: string;
  created_at: string;
}
