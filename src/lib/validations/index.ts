import { z } from "zod";

/**
 * Strips control characters, HTML script/style tags, and normalises whitespace
 * to defend against stored XSS and malformed payloads.
 */
export function sanitiseText(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, "")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .trim();
}

const currentYear = new Date().getFullYear();
const maxEligibleBirthYear = currentYear - 18;

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .transform(sanitiseText)
      .pipe(z.string().min(2, "First name must be at least 2 characters").max(50, "First name is too long")),
    email: z.string().trim().toLowerCase().email("Please enter a valid email address").max(254),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .regex(/[A-Za-z]/, "Password must include at least one letter")
      .regex(/[0-9]/, "Password must include at least one number"),
    confirmPassword: z.string(),
    ageConfirmed18Plus: z.literal(true, {
      errorMap: () => ({ message: "You must confirm that you are 18 years or older to join SpaceSync." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(/[A-Za-z]/, "Password must include at least one letter")
      .regex(/[0-9]/, "Password must include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const basicInfoSchema = z.object({
  first_name: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().min(2, "First name must be at least 2 characters").max(50)),
  age_confirmed_18_plus: z.literal(true, {
    errorMap: () => ({ message: "Minimum age eligibility (18+) is required." }),
  }),
  birth_year: z
    .number({ invalid_type_error: "Please enter a valid birth year" })
    .int()
    .min(1925, "Birth year must be 1925 or later")
    .max(maxEligibleBirthYear, `You must be at least 18 years old (born ${maxEligibleBirthYear} or earlier)`)
    .nullable()
    .optional(),
  avatar_url: z.string().url().nullable().optional().or(z.literal("")),
  bio: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().max(600, "Bio must be 600 characters or fewer"))
    .optional()
    .default(""),
  occupation_title: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().max(120, "Occupation title must be 120 characters or fewer"))
    .optional()
    .default(""),
  occupation_category: z
    .enum(["student", "mba_student", "working_professional", "founder_freelancer", "relocating", "other"])
    .nullable()
    .optional(),
  institution_or_company: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().max(120))
    .optional()
    .default(""),
  city: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().min(2, "Please select or enter your city").max(80)),
  search_intent: z.enum(["looking_for_flatmate", "have_shared_space", "exploring_both"]),
});

export const lifestylePreferencesSchema = z.object({
  sleep_schedule: z.enum(["early_bird", "balanced", "night_owl", "flexible_shift"]).nullable().optional(),
  cleanliness_level: z.enum(["spotless", "tidy_shared_spaces", "relaxed", "weekly_deep_clean"]).nullable().optional(),
  cooking_habits: z.enum(["daily_cook", "occasional_cook", "mostly_order_in", "meal_prep_weekends"]).nullable().optional(),
  dietary_preference: z
    .enum(["strict_veg_kitchen", "veg_preferred_flexible", "non_veg_comfortable", "vegan"])
    .nullable()
    .optional(),
  smoking_preference: z.enum(["never", "outside_only", "occasionally_indoors", "tolerant"]).nullable().optional(),
  guests_overnight: z.enum(["rarely", "occasional_with_notice", "weekends_welcome", "anytime_open"]).nullable().optional(),
  noise_tolerance: z.enum(["quiet_sanctuary", "moderate_daytime", "lively_music_friendly"]).nullable().optional(),
  socialising_at_home: z
    .enum(["quiet_retreat", "small_dinners_boardgames", "frequent_gatherings"])
    .nullable()
    .optional(),
  work_study_routine: z
    .enum(["mostly_office_campus", "hybrid", "mostly_from_home", "late_study_hours"])
    .nullable()
    .optional(),
  pet_preference: z.enum(["no_pets", "have_pets", "love_pets_dont_own", "allergic"]).nullable().optional(),
  chore_arrangement: z.enum(["shared_roster", "hired_househelp", "clean_as_you_go", "flexible"]).nullable().optional(),
});

export const personalityPreferencesSchema = z.object({
  social_interaction_level: z
    .enum(["mostly_independent", "friendly_checkins", "hangout_regularly", "close_friends_vibe"])
    .nullable()
    .optional(),
  energy_orientation: z.enum(["recharge_alone", "ambivert_balanced", "energised_by_company"]).nullable().optional(),
  communication_style: z
    .enum(["direct_and_immediate", "gentle_in_person", "async_message_first", "scheduled_house_sync"])
    .nullable()
    .optional(),
  conflict_resolution: z
    .enum(["address_early_calmly", "cool_off_then_talk", "written_note_first", "compromise_focused"])
    .nullable()
    .optional(),
  home_atmosphere: z
    .enum(["calm_minimalist", "warm_cozy_shared", "creative_bustling", "structured_academic"])
    .nullable()
    .optional(),
  shared_vs_independent_time: z
    .enum(["80_independent_20_shared", "50_50_balanced", "30_independent_70_shared"])
    .nullable()
    .optional(),
});

export const livingPreferencesSchema = z
  .object({
    budget_min_inr: z
      .number({ invalid_type_error: "Minimum budget must be a number" })
      .int()
      .min(2000, "Minimum monthly budget must be at least ₹2,000")
      .max(250000, "Minimum monthly budget must be ₹2,50,000 or less")
      .nullable()
      .optional(),
    budget_max_inr: z
      .number({ invalid_type_error: "Maximum budget must be a number" })
      .int()
      .min(2000, "Maximum monthly budget must be at least ₹2,000")
      .max(300000, "Maximum monthly budget must be ₹3,00,000 or less")
      .nullable()
      .optional(),
    preferred_areas: z
      .array(z.string().transform(sanitiseText).pipe(z.string().min(1).max(80)))
      .max(12, "Select up to 12 preferred neighbourhoods")
      .default([]),
    moving_timeline: z
      .enum(["immediate", "within_1_month", "1_to_3_months", "flexible_3_plus_months"])
      .nullable()
      .optional(),
    living_arrangement: z
      .enum(["private_room_2bhk", "private_room_3bhk", "shared_room", "studio_coliving", "flexible"])
      .nullable()
      .optional(),
    household_boundaries: z
      .array(z.string().transform(sanitiseText).pipe(z.string().min(1).max(100)))
      .max(15)
      .default([]),
    non_negotiables: z
      .array(z.string().transform(sanitiseText).pipe(z.string().min(1).max(100)))
      .max(15)
      .default([]),
  })
  .refine(
    (data) => {
      if (data.budget_min_inr != null && data.budget_max_inr != null) {
        return data.budget_min_inr <= data.budget_max_inr;
      }
      return true;
    },
    {
      message: "Minimum budget cannot exceed maximum budget",
      path: ["budget_max_inr"],
    }
  );

export const preferenceImportanceItemSchema = z.object({
  question_key: z.string().min(1).max(64),
  importance: z.enum(["low", "medium", "high"]),
  is_dealbreaker: z.boolean().default(false),
});

export const preferenceImportanceArraySchema = z.array(preferenceImportanceItemSchema).max(30);

export const privacyPreferencesSchema = z.object({
  discoverable_in_search: z.boolean().default(true),
  show_institution_or_company: z.boolean().default(true),
  show_exact_neighborhoods: z.boolean().default(true),
  share_contact_with_matches: z.boolean().default(false),
  contact_phone_or_handle: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().max(100))
    .optional()
    .default(""),
  notify_new_interests: z.boolean().default(true),
  notify_mutual_matches: z.boolean().default(true),
  notify_messages: z.boolean().default(true),
});

export const expressInterestSchema = z.object({
  targetUserId: z.string().uuid("Invalid target user ID"),
  action: z.enum(["interest", "pass", "withdraw", "decline"]),
  introNote: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().max(280, "Introductory note must be 280 characters or fewer"))
    .optional()
    .default(""),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID"),
  body: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().min(1, "Message cannot be empty").max(2000, "Message must be 2,000 characters or fewer")),
});

export const blockUserSchema = z.object({
  blockedUserId: z.string().uuid("Invalid user ID"),
  reason: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().max(300))
    .optional()
    .default(""),
});

export const reportUserSchema = z.object({
  reportedUserId: z.string().uuid("Invalid reported user ID"),
  conversationId: z.string().uuid().nullable().optional(),
  reason: z.enum([
    "harassment_or_abuse",
    "fake_or_misleading_profile",
    "spam_or_commercial_solicitation",
    "inappropriate_content",
    "discrimination_or_hate_speech",
    "off_platform_scam_attempt",
    "other",
  ]),
  description: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().max(1000, "Description must be 1,000 characters or fewer"))
    .optional()
    .default(""),
});

export const waitlistSignupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address").max(254),
  intended_city: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().min(2, "Please enter or select your intended city").max(80)),
  moving_timeline: z
    .enum(["immediate", "within_1_month", "1_to_3_months", "flexible_3_plus_months"])
    .nullable()
    .optional(),
  consent_communications: z.literal(true, {
    errorMap: () => ({ message: "Please consent to receive launch notifications to join the waitlist." }),
  }),
});

export const moderationActionSchema = z.object({
  actionType: z.enum(["resolve_report", "dismiss_report", "suspend_user", "reactivate_user"]),
  reportId: z.string().uuid().optional().nullable(),
  targetUserId: z.string().uuid().optional().nullable(),
  notes: z
    .string()
    .transform(sanitiseText)
    .pipe(z.string().max(1000))
    .optional()
    .default(""),
});
