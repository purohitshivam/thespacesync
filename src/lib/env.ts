/**
 * Environment Configuration & Blocker Inspection Utility
 * Detects whether external services (Supabase, Razorpay) are configured with real credentials.
 * Never falls back to dummy data or simulated persistence when credentials are absent.
 */

const PLACEHOLDER_VALUES = new Set([
  "",
  "https://your-project-ref.supabase.co",
  "your-supabase-publishable-anon-key",
  "your-supabase-service-role-secret-key",
  "rzp_test_your_key_id",
  "your_razorpay_key_secret",
  "your_razorpay_webhook_signing_secret",
]);

function isRealValue(val: string | undefined): val is string {
  if (!val) return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (PLACEHOLDER_VALUES.has(trimmed)) return false;
  return true;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasServiceRole: boolean;
  url: string;
  anonKey: string;
  missingVars: string[];
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  const missingVars: string[] = [];
  if (!isRealValue(url)) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!isRealValue(anonKey)) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return {
    isConfigured: missingVars.length === 0,
    hasServiceRole: isRealValue(serviceRoleKey),
    url: isRealValue(url) ? url.trim() : "",
    anonKey: isRealValue(anonKey) ? anonKey.trim() : "",
    missingVars,
  };
}

export interface RazorpayConfigStatus {
  isConfigured: boolean;
  hasWebhookSecret: boolean;
  keyId: string;
  missingVars: string[];
}

export function getRazorpayConfigStatus(): RazorpayConfigStatus {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const missingVars: string[] = [];
  if (!isRealValue(keyId)) {
    missingVars.push("NEXT_PUBLIC_RAZORPAY_KEY_ID");
  }
  if (!isRealValue(keySecret)) {
    missingVars.push("RAZORPAY_KEY_SECRET");
  }
  if (!isRealValue(webhookSecret)) {
    missingVars.push("RAZORPAY_WEBHOOK_SECRET");
  }

  return {
    isConfigured: isRealValue(keyId) && isRealValue(keySecret),
    hasWebhookSecret: isRealValue(webhookSecret),
    keyId: isRealValue(keyId) ? keyId.trim() : "",
    missingVars,
  };
}

export function getAdminEmails(): string[] {
  const raw =
    process.env.SPACESYNC_ADMIN_EMAILS ||
    process.env.ADMIN_EMAILS ||
    "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
