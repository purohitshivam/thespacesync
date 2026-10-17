"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { PrivacyPreferencesRow } from "@/types/database";
import {
  ShieldCheck,
  Bell,
  Ban,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface BlockedUserItem {
  blockedUserId: string;
  firstName: string;
  createdAt: string;
}

interface SettingsClientProps {
  initialPrivacy: PrivacyPreferencesRow;
  isPublished: boolean;
  blockedUsers: BlockedUserItem[];
}

export function SettingsClient({
  initialPrivacy,
  isPublished,
  blockedUsers,
}: SettingsClientProps) {
  const router = useRouter();

  const [discoverable, setDiscoverable] = useState(
    initialPrivacy.discoverable_in_search
  );
  const [showOrg, setShowOrg] = useState(
    initialPrivacy.show_institution_or_company
  );
  const [showAreas, setShowAreas] = useState(
    initialPrivacy.show_exact_neighborhoods
  );
  const [shareContact, setShareContact] = useState(
    initialPrivacy.share_contact_with_matches
  );
  const [contactHandle, setContactHandle] = useState(
    initialPrivacy.contact_phone_or_handle || ""
  );
  const [notifyInterests, setNotifyInterests] = useState(
    initialPrivacy.notify_new_interests
  );
  const [notifyMatches, setNotifyMatches] = useState(
    initialPrivacy.notify_mutual_matches
  );
  const [notifyMessages, setNotifyMessages] = useState(
    initialPrivacy.notify_messages
  );
  const [published, setPublished] = useState(isPublished);
  const [blocks, setBlocks] = useState<BlockedUserItem[]>(blockedUsers);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: published,
          privacy: {
            discoverable_in_search: discoverable,
            show_institution_or_company: showOrg,
            show_exact_neighborhoods: showAreas,
            share_contact_with_matches: shareContact,
            contact_phone_or_handle: contactHandle,
            notify_new_interests: notifyInterests,
            notify_mutual_matches: notifyMatches,
            notify_messages: notifyMessages,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "err",
          text: data.error || "Failed to save privacy settings.",
        });
        return;
      }
      setFeedback({
        type: "ok",
        text: "Privacy and notification settings saved.",
      });
      router.refresh();
    } catch {
      setFeedback({ type: "err", text: "Network error while saving settings." });
    } finally {
      setSaving(false);
    }
  }

  async function handleUnblock(blockedUserId: string) {
    const res = await fetch(
      `/api/safety/block?blockedUserId=${encodeURIComponent(blockedUserId)}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setBlocks((prev) => prev.filter((b) => b.blockedUserId !== blockedUserId));
      router.refresh();
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: "err",
          text: data.error || "Failed to delete account.",
        });
        return;
      }
      router.push("/?accountDeleted=true");
      router.refresh();
    } catch {
      setFeedback({
        type: "err",
        text: "Network error while deleting account.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            feedback.type === "ok"
              ? "bg-forest/10 border-forest/30 text-forest"
              : "bg-terracotta/10 border-terracotta/40 text-terracotta-dark"
          }`}
        >
          {feedback.type === "ok" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Privacy & Visibility Form */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-6"
      >
        <div className="flex items-center gap-2 text-forest font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-terracotta" />
          <span>Profile Visibility & Contact Privacy</span>
        </div>

        <div className="space-y-4 text-xs text-charcoal">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="mt-0.5 rounded border-border text-forest"
            />
            <div>
              <p className="font-semibold">Publish my profile in Discovery</p>
              <p className="text-muted">
                Uncheck anytime once you have found a flatmate or want to pause incoming interests.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={discoverable}
              onChange={(e) => setDiscoverable(e.target.checked)}
              className="mt-0.5 rounded border-border text-forest"
            />
            <div>
              <p className="font-semibold">Allow my profile to appear in city search results</p>
              <p className="text-muted">
                Controls whether other verified members can discover your profile card.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showOrg}
              onChange={(e) => setShowOrg(e.target.checked)}
              className="mt-0.5 rounded border-border text-forest"
            />
            <div>
              <p className="font-semibold">Show my university or company name on my profile</p>
              <p className="text-muted">
                When unchecked, only your broad occupation category is shown.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showAreas}
              onChange={(e) => setShowAreas(e.target.checked)}
              className="mt-0.5 rounded border-border text-forest"
            />
            <div>
              <p className="font-semibold">Display my shortlisted neighbourhoods on discovery cards</p>
              <p className="text-muted">
                Neighbourhood overlap will still be used for your Peace Score even if hidden on cards.
              </p>
            </div>
          </label>

          <div className="pt-3 border-t border-border space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shareContact}
                onChange={(e) => setShareContact(e.target.checked)}
                className="mt-0.5 rounded border-border text-forest"
              />
              <div>
                <p className="font-semibold">
                  Share optional phone / handle with confirmed mutual matches
                </p>
                <p className="text-muted">
                  Kept strictly private by default. Even when enabled, only active mutual matches can view this field (enforced via PostgreSQL RLS).
                </p>
              </div>
            </label>

            {shareContact && (
              <div className="max-w-md pl-6">
                <input
                  type="text"
                  maxLength={100}
                  value={contactHandle}
                  onChange={(e) => setContactHandle(e.target.value)}
                  placeholder="e.g. WhatsApp / Telegram / LinkedIn handle"
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-ivory text-xs text-charcoal"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="pt-6 border-t border-border space-y-4">
          <div className="flex items-center gap-2 text-forest font-semibold text-sm">
            <Bell className="w-4 h-4 text-terracotta" />
            <span>Notification Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center gap-2 p-3 rounded-2xl bg-ivory border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={notifyInterests}
                onChange={(e) => setNotifyInterests(e.target.checked)}
                className="rounded border-border text-forest"
              />
              <span>New incoming interests</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-2xl bg-ivory border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={notifyMatches}
                onChange={(e) => setNotifyMatches(e.target.checked)}
                className="rounded border-border text-forest"
              />
              <span>Mutual matches</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-2xl bg-ivory border border-border cursor-pointer">
              <input
                type="checkbox"
                checked={notifyMessages}
                onChange={(e) => setNotifyMessages(e.target.checked)}
                className="rounded border-border text-forest"
              />
              <span>New chat messages</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-full bg-forest hover:bg-forest-light text-ivory text-xs font-semibold transition"
        >
          {saving ? "Saving Settings..." : "Save Privacy & Notification Settings"}
        </button>
      </form>

      {/* Blocked Accounts Management */}
      <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-warm space-y-4">
        <div className="flex items-center gap-2 text-charcoal font-semibold text-sm">
          <Ban className="w-4 h-4 text-terracotta" />
          <span>Blocked Users ({blocks.length})</span>
        </div>
        <p className="text-xs text-muted">
          Blocked users cannot view your profile, express interest, or send messages.
        </p>

        {blocks.length === 0 ? (
          <p className="text-xs text-muted italic">You have not blocked any accounts.</p>
        ) : (
          <div className="divide-y divide-border text-xs">
            {blocks.map((b) => (
              <div
                key={b.blockedUserId}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="font-semibold text-charcoal">{b.firstName}</span>
                  <span className="text-muted ml-2">
                    Blocked on {new Date(b.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnblock(b.blockedUserId)}
                  className="px-3.5 py-1.5 rounded-full border border-border hover:bg-sand text-charcoal font-medium"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permanent Account Deletion */}
      <form
        onSubmit={handleDeleteAccount}
        className="bg-white border border-terracotta/40 rounded-3xl p-6 md:p-8 shadow-warm space-y-4"
      >
        <div className="flex items-center gap-2 text-terracotta-dark font-semibold text-sm">
          <Trash2 className="w-4 h-4" />
          <span>Permanent Account Deletion</span>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Deleting your account permanently removes your profile, preferences, Peace Score weights, interests, matches, and messages. This action cannot be undone.
        </p>

        <div className="max-w-md space-y-2">
          <label className="block text-xs font-medium text-charcoal">
            Type <code className="font-mono font-bold">DELETE MY ACCOUNT</code> to confirm:
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE MY ACCOUNT"
            className="w-full px-3.5 py-2 rounded-xl border border-border bg-ivory text-xs text-charcoal"
          />
        </div>

        <button
          type="submit"
          disabled={deleting || deleteConfirmText !== "DELETE MY ACCOUNT"}
          className="px-5 py-2.5 rounded-full bg-terracotta hover:bg-terracotta-dark disabled:opacity-40 text-ivory text-xs font-semibold transition"
        >
          {deleting ? "Deleting Account..." : "Permanently Delete My Account"}
        </button>
      </form>
    </div>
  );
}
