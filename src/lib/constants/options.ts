export const PRIMARY_CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Gurgaon",
  "Noida",
  "Kolkata",
  "Ahmedabad",
  "Other City",
] as const;

export const CITY_NEIGHBOURHOODS: Record<string, string[]> = {
  Bangalore: [
    "Indiranagar",
    "Koramangala",
    "HSR Layout",
    "Whitefield",
    "Bellandur",
    "Jayanagar",
    "JP Nagar",
    "Marathahalli",
    "Malleshwaram",
    "Hebbal",
    "Sarjapur Road",
    "Domlur",
  ],
  Mumbai: [
    "Bandra West",
    "Andheri West",
    "Powai",
    "Lower Parel",
    "Worli",
    "Juhu",
    "Goregaon",
    "Malad",
    "BKC / Santacruz",
    "Chembur",
    "Versova",
    "Colaba / Fort",
  ],
  "Delhi NCR": [
    "DLF Cyber City / Phase 1-5 (Gurgaon)",
    "Golf Course Road (Gurgaon)",
    "Sohna Road (Gurgaon)",
    "Hauz Khas (South Delhi)",
    "Greater Kailash (South Delhi)",
    "Saket / Malviya Nagar",
    "Vasant Kunj",
    "Connaught Place / Central",
    "Sector 18 / 62 (Noida)",
    "Sector 44 / 50 (Gurgaon)",
  ],
  Gurgaon: [
    "DLF Phase 1-5",
    "Golf Course Road",
    "Sector 43 / Sushant Lok",
    "Sector 56 / Golf Course Ext",
    "Sohna Road",
    "Udyog Vihar / Cyberhub",
  ],
  Noida: ["Sector 15 / 18", "Sector 62", "Sector 125 / Expressway", "Sector 50 / 76"],
  Pune: ["Koregaon Park", "Viman Nagar", "Kalyani Nagar", "Baner", "Balewadi", "Hinjewadi", "Kothrud"],
  Hyderabad: ["Gachibowli", "Jubilee Hills", "Banjara Hills", "Madhapur", "HITEC City", "Kondapur"],
  Chennai: ["Adyar", "Anna Nagar", "OMR / Thoraipakkam", "Velachery", "Nungambakkam", "Besant Nagar"],
};

export const HOUSEHOLD_BOUNDARIES_OPTIONS = [
  "Quiet hours after 11:30 PM on weeknights",
  "Advance heads-up before overnight guests",
  "Separate shelves & labelled groceries in fridge",
  "Split utility & Wi-Fi bills on the 1st of every month",
  "Keep kitchen sink clear before going to bed",
  "No smoking inside common rooms",
  "Respect closed bedroom doors during WFH calls",
  "Share maid / cook salaries equally",
] as const;

export const NON_NEGOTIABLES_OPTIONS = [
  "Strictly smoke-free indoors",
  "Strictly vegetarian kitchen utensils",
  "On-time rent & utility split without reminders",
  "Pet-friendly flat",
  "Pet-free flat (allergies)",
  "No late-night weekday house parties",
  "LGBTQIA+ affirming household",
  "Air-conditioned bedroom required",
] as const;

export interface QuestionOption {
  value: string;
  label: string;
  hint?: string;
}

export const OCCUPATION_CATEGORY_OPTIONS: QuestionOption[] = [
  { value: "student", label: "Undergraduate / Postgraduate Student" },
  { value: "mba_student", label: "MBA / Executive Cohort Student" },
  { value: "working_professional", label: "Working Professional" },
  { value: "founder_freelancer", label: "Founder / Independent Consultant" },
  { value: "relocating", label: "Relocating for New Role or Campus" },
  { value: "other", label: "Other" },
];

export const SEARCH_INTENT_OPTIONS: QuestionOption[] = [
  {
    value: "looking_for_flatmate",
    label: "Looking for a compatible flatmate to find a flat together",
    hint: "Team up first, then shortlist apartments in your shared budget",
  },
  {
    value: "have_shared_space",
    label: "I already have a flat and need a compatible flatmate",
    hint: "You have an existing lease or room and care about who moves in",
  },
  {
    value: "exploring_both",
    label: "Open to either joining a flat or hunting together",
    hint: "Flexible as long as the flatmate rhythm feels right",
  },
];

export const LIFESTYLE_QUESTIONS: {
  key: string;
  title: string;
  subtitle: string;
  options: QuestionOption[];
}[] = [
  {
    key: "sleep_schedule",
    title: "What does your typical weekday sleep schedule look like?",
    subtitle: "Helps align morning bathroom rushes and late-night kitchen or study hours.",
    options: [
      { value: "early_bird", label: "Early bird", hint: "Asleep by 10:30 PM, up around 6–7 AM" },
      { value: "balanced", label: "Balanced rhythm", hint: "Asleep around 11:30 PM, up by 7:30–8:30 AM" },
      { value: "night_owl", label: "Night owl", hint: "Active past 1 AM, later mornings" },
      { value: "flexible_shift", label: "Flexible / irregular hours", hint: "Varies by project, classes, or shifts" },
    ],
  },
  {
    key: "cleanliness_level",
    title: "How do you like shared living spaces kept?",
    subtitle: "Differences in tidiness are the #1 source of flatmate friction.",
    options: [
      { value: "spotless", label: "Spotless & organised daily", hint: "Counters wiped and nothing left lying around" },
      { value: "tidy_shared_spaces", label: "Tidy in common areas", hint: "Living room and kitchen kept neat; bedrooms are personal" },
      { value: "weekly_deep_clean", label: "Weekly scheduled reset", hint: "Lived-in during the week with a thorough weekend reset" },
      { value: "relaxed", label: "Relaxed & easygoing", hint: "Don't mind a bit of clutter as long as it's hygienic" },
    ],
  },
  {
    key: "cooking_habits",
    title: "How often do you cook in the kitchen?",
    subtitle: "Note: Different cooking habits often complement each other (less stove crowding!).",
    options: [
      { value: "daily_cook", label: "Cook almost daily", hint: "Enjoy preparing fresh meals or hiring a daily cook" },
      { value: "occasional_cook", label: "Cook 2–3 times a week", hint: "Mix of light cooking and ordering/dining out" },
      { value: "meal_prep_weekends", label: "Batch meal-prep on weekends", hint: "Quick reheating on weekdays" },
      { value: "mostly_order_in", label: "Mostly order in / campus mess", hint: "Mainly use the kitchen for coffee, tea, or breakfast" },
    ],
  },
  {
    key: "dietary_preference",
    title: "What are your kitchen dietary boundaries?",
    subtitle: "Ensures kitchen comfort around vegetarian, vegan, or non-vegetarian cooking.",
    options: [
      { value: "strict_veg_kitchen", label: "Strictly vegetarian kitchen", hint: "Prefer no meat/eggs cooked in shared utensils" },
      { value: "veg_preferred_flexible", label: "Vegetarian, flexible kitchen", hint: "I eat veg, comfortable if flatmate cooks non-veg" },
      { value: "non_veg_comfortable", label: "Eats non-veg / open kitchen", hint: "Comfortable with all types of cooking" },
      { value: "vegan", label: "Plant-based / vegan", hint: "Plant-based diet; respectful of shared shelves" },
    ],
  },
  {
    key: "smoking_preference",
    title: "What is your preference regarding smoking at home?",
    subtitle: "Matches your comfort level for indoor air quality and balcony usage.",
    options: [
      { value: "never", label: "Strictly smoke-free home", hint: "Prefer a completely smoke-free flat" },
      { value: "outside_only", label: "Outdoors / balcony only", hint: "Never inside common rooms or bedrooms" },
      { value: "tolerant", label: "Non-smoker, comfortable around smokers", hint: "Fine as long as common areas stay ventilated" },
      { value: "occasionally_indoors", label: "Occasional indoor smoker", hint: "Looking for an equally relaxed smoker-friendly flat" },
    ],
  },
  {
    key: "guests_overnight",
    title: "How do you feel about friends or overnight guests visiting?",
    subtitle: "Aligns expectations around privacy, utility usage, and shared living rooms.",
    options: [
      { value: "rarely", label: "Rarely host overnight guests", hint: "Prefer keeping the flat primarily to residents" },
      { value: "occasional_with_notice", label: "Occasional guests with a heads-up", hint: "Happy to host friends/family with advance notice" },
      { value: "weekends_welcome", label: "Friends welcome on weekends", hint: "Enjoy having friends over on Friday/Saturday" },
      { value: "anytime_open", label: "Open-door social home", hint: "Friends and partners drop by frequently" },
    ],
  },
  {
    key: "noise_tolerance",
    title: "What acoustic vibe feels most like home to you?",
    subtitle: "Balances focus hours, calls, music, and relaxation.",
    options: [
      { value: "quiet_sanctuary", label: "Quiet sanctuary", hint: "Headphones for media; peaceful atmosphere" },
      { value: "moderate_daytime", label: "Moderate daytime activity", hint: "Normal conversation & music by day, quiet after 11 PM" },
      { value: "lively_music_friendly", label: "Lively & music-friendly", hint: "Enjoy speakers, instruments, or background TV" },
    ],
  },
  {
    key: "socialising_at_home",
    title: "How do you view hosting or socialising in the flat?",
    subtitle: "Helps pair quiet sanctuary seekers with like-minded flatmates.",
    options: [
      { value: "quiet_retreat", label: "Home is a quiet retreat", hint: "Prefer socialising outside at cafes or clubs" },
      { value: "small_dinners_boardgames", label: "Small dinners & board games", hint: "Cozy 3–5 person get-togethers occasionally" },
      { value: "frequent_gatherings", label: "Frequent social hosting", hint: "Love hosting cohort mixers, match nights, or dinners" },
    ],
  },
  {
    key: "work_study_routine",
    title: "Where do you spend most of your weekday work or study hours?",
    subtitle: "Helps plan Wi-Fi load, daytime electricity/AC usage, and quiet call zones.",
    options: [
      { value: "mostly_office_campus", label: "At office or campus 5 days a week", hint: "Out from ~9 AM to 7 PM on weekdays" },
      { value: "hybrid", label: "Hybrid schedule (2–3 days WFH)", hint: "Mix of office/campus and home desk days" },
      { value: "mostly_from_home", label: "Work or study mostly from home", hint: "Need a reliable, calm daytime workspace" },
      { value: "late_study_hours", label: "Evening / late-night study sessions", hint: "Common for MBA cohorts, exams, or global timezones" },
    ],
  },
  {
    key: "pet_preference",
    title: "What is your situation and preference around pets?",
    subtitle: "Flags allergies early and connects pet lovers.",
    options: [
      { value: "no_pets", label: "Prefer a pet-free flat", hint: "No pets currently and prefer not living with animals" },
      { value: "love_pets_dont_own", label: "Love pets (don't own one)", hint: "Delighted if my flatmate brings a dog or cat!" },
      { value: "have_pets", label: "I have a pet moving in with me", hint: "Looking for a welcoming, pet-safe home" },
      { value: "allergic", label: "Allergic to pets", hint: "Require a strictly pet-free environment for health reasons" },
    ],
  },
  {
    key: "chore_arrangement",
    title: "How do you prefer handling cleaning and household chores?",
    subtitle: "Most Indian shared flats combine daily househelp with personal upkeep.",
    options: [
      { value: "hired_househelp", label: "Hire shared househelp (maid/cook)", hint: "Split monthly cost for daily sweeping, mopping, and dishes" },
      { value: "clean_as_you_go", label: "Clean as you go", hint: "Everyone washes their own dishes and wipes up immediately" },
      { value: "shared_roster", label: "Structured weekly chore roster", hint: "Clear rotation for trash, groceries, and common rooms" },
      { value: "flexible", label: "Flexible & collaborative", hint: "Happy to adapt to whatever system works best" },
    ],
  },
];

export const PERSONALITY_QUESTIONS: {
  key: string;
  title: string;
  subtitle: string;
  options: QuestionOption[];
}[] = [
  {
    key: "social_interaction_level",
    title: "What kind of relationship do you hope to have with your flatmate?",
    subtitle: "Self-description of your preferred social dynamic — every style is valid.",
    options: [
      { value: "mostly_independent", label: "Warm & independent", hint: "Cordial, respectful housemates with separate social lives" },
      { value: "friendly_checkins", label: "Friendly daily tea/coffee chats", hint: "Catch up in the kitchen while respecting solo time" },
      { value: "hangout_regularly", label: "Regular shared meals & outings", hint: "Cook together or explore the city on weekends" },
      { value: "close_friends_vibe", label: "Close-knit home community", hint: "Looking for a flatmate who becomes a close friend" },
    ],
  },
  {
    key: "energy_orientation",
    title: "How do you typically recharge after a long day?",
    subtitle: "A descriptive preference (not a psychological diagnosis).",
    options: [
      { value: "recharge_alone", label: "Quiet solo downtime", hint: "Reading, shows, or resting in my room recharges me" },
      { value: "ambivert_balanced", label: "Balanced mix", hint: "Depends on the week — enjoy both solo evenings and lively chats" },
      { value: "energised_by_company", label: "Energised by conversation", hint: "Love unwinding by chatting in the living room" },
    ],
  },
  {
    key: "communication_style",
    title: "How do you prefer bringing up household logistics or requests?",
    subtitle: "Knowing each other's style prevents misunderstandings.",
    options: [
      { value: "direct_and_immediate", label: "Direct & in the moment", hint: "Prefer a quick, straightforward spoken heads-up right away" },
      { value: "gentle_in_person", label: "Gentle in-person conversation", hint: "Bring it up warmly over evening tea" },
      { value: "async_message_first", label: "WhatsApp / text message first", hint: "Drop a polite message on the flat group so there's no pressure" },
      { value: "scheduled_house_sync", label: "Periodic house check-in", hint: "A 10-minute Sunday check-in on bills, repairs, and plans" },
    ],
  },
  {
    key: "conflict_resolution",
    title: "If a small disagreement comes up at home, how do you handle it?",
    subtitle: "Helps build psychological safety in shared homes.",
    options: [
      { value: "address_early_calmly", label: "Address it early & calmly", hint: "Talk it through before small things build up" },
      { value: "cool_off_then_talk", label: "Reflect first, then talk", hint: "Take a few hours to organise thoughts before discussing" },
      { value: "written_note_first", label: "Write it out thoughtfully", hint: "Share context via message first, then chat in person" },
      { value: "compromise_focused", label: "Pragmatic middle ground", hint: "Focus quickly on practical solutions that work for both" },
    ],
  },
  {
    key: "home_atmosphere",
    title: "How would you describe your ideal home atmosphere?",
    subtitle: "Aligns how the shared living room feels day to day.",
    options: [
      { value: "calm_minimalist", label: "Calm & uncluttered", hint: "Minimalist surfaces, soft lighting, peaceful energy" },
      { value: "warm_cozy_shared", label: "Warm, lived-in & cozy", hint: "Plants, books, floor cushions, and shared chai" },
      { value: "structured_academic", label: "Focused & study/work oriented", hint: "Great for MBA students, exam prep, or deep work" },
      { value: "creative_bustling", label: "Creative & energetic", hint: "Art, music, brainstorming, and active common spaces" },
    ],
  },
  {
    key: "shared_vs_independent_time",
    title: "What balance of independent time vs shared flat activities feels right?",
    subtitle: "Sets clear expectations so nobody feels crowded or ignored.",
    options: [
      { value: "80_independent_20_shared", label: "80% independent / 20% shared", hint: "Mostly solo schedules with occasional shared meals" },
      { value: "50_50_balanced", label: "50% independent / 50% shared", hint: "Equal mix of personal space and hanging out at home" },
      { value: "30_independent_70_shared", label: "30% independent / 70% shared", hint: "Love doing groceries, cooking, and chilling together" },
    ],
  },
];

export const MOVING_TIMELINE_OPTIONS: QuestionOption[] = [
  { value: "immediate", label: "Immediate (within 2 weeks)" },
  { value: "within_1_month", label: "Within 1 month" },
  { value: "1_to_3_months", label: "In 1 to 3 months" },
  { value: "flexible_3_plus_months", label: "3+ months / flexible" },
];

export const LIVING_ARRANGEMENT_OPTIONS: QuestionOption[] = [
  { value: "private_room_2bhk", label: "Private bedroom in a 2BHK" },
  { value: "private_room_3bhk", label: "Private bedroom in a 3BHK+" },
  { value: "shared_room", label: "Shared bedroom (twin sharing)" },
  { value: "studio_coliving", label: "Co-living / studio floor" },
  { value: "flexible", label: "Flexible on 2BHK or 3BHK setup" },
];

export const ALL_IMPORTANCE_QUESTIONS = [
  { key: "budget_range", label: "Monthly Budget Overlap", category: "Living" },
  { key: "preferred_areas", label: "Preferred Neighbourhoods", category: "Living" },
  { key: "moving_timeline", label: "Moving Timeline", category: "Living" },
  { key: "cleanliness_level", label: "Cleanliness & Upkeep", category: "Lifestyle" },
  { key: "sleep_schedule", label: "Sleep Schedule", category: "Lifestyle" },
  { key: "dietary_preference", label: "Kitchen & Dietary Preference", category: "Lifestyle" },
  { key: "smoking_preference", label: "Smoking Boundaries", category: "Lifestyle" },
  { key: "guests_overnight", label: "Guests & Overnight Visitors", category: "Lifestyle" },
  { key: "noise_tolerance", label: "Noise Tolerance", category: "Lifestyle" },
  { key: "pet_preference", label: "Pets at Home", category: "Lifestyle" },
  { key: "cooking_habits", label: "Cooking Habits", category: "Lifestyle" },
  { key: "chore_arrangement", label: "Household Chores", category: "Lifestyle" },
  { key: "social_interaction_level", label: "Social Interaction Level", category: "Personality" },
  { key: "communication_style", label: "Communication Style", category: "Personality" },
  { key: "conflict_resolution", label: "Conflict Resolution", category: "Personality" },
  { key: "home_atmosphere", label: "Home Atmosphere", category: "Personality" },
] as const;
