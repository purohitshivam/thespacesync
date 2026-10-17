"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  HeartHandshake,
  MessageSquare,
  Bell,
  User,
  Settings,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Sparkles,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface NavbarUser {
  id: string;
  email?: string;
  firstName?: string;
  isAdmin?: boolean;
  unreadNotificationsCount?: number;
}

export function Navbar({ user }: { user: NavbarUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const publicLinks = [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/peace-score", label: "Peace Score" },
    { href: "/discover", label: "Discover" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/faqs", label: "FAQs" },
  ];

  const appLinks = [
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/connections", label: "Connections", icon: HeartHandshake },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/onboarding", label: "Onboarding", icon: Sparkles },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  async function handleLogout() {
    setSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
      setMobileMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="SpaceSync Home"
        >
          <div className="w-9 h-9 rounded-full bg-forest flex items-center justify-center text-ivory relative shadow-sm">
            <span className="font-serif font-semibold text-base tracking-tight">S</span>
            <span className="w-2 h-2 rounded-full bg-terracotta absolute -top-0.5 -right-0.5 border border-ivory" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-semibold text-charcoal tracking-tight leading-none">
              SpaceSync
            </span>
            <span className="text-[10px] text-muted tracking-wider uppercase mt-0.5">
              Peaceful Flatsharing
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
          {(user ? appLinks : publicLinks).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition ${
                  isActive
                    ? "bg-sand text-forest font-semibold"
                    : "text-charcoal hover:bg-sand/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {user?.isAdmin && (
            <Link
              href="/admin"
              className={`px-3.5 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1.5 transition ${
                pathname.startsWith("/admin")
                  ? "bg-terracotta text-ivory"
                  : "text-terracotta-dark hover:bg-sand/60"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/notifications"
                className="relative p-2 rounded-full text-charcoal hover:bg-sand transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {Boolean(user.unreadNotificationsCount && user.unreadNotificationsCount > 0) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-terracotta border border-ivory" />
                )}
              </Link>
              <Link
                href="/settings"
                className="p-2 rounded-full text-charcoal hover:bg-sand transition"
                aria-label="Account Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-white hover:bg-sand text-xs font-medium text-charcoal transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-sm font-medium text-charcoal hover:bg-sand/70 transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-forest hover:bg-forest-light text-ivory shadow-sm transition"
              >
                Create Profile
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-xl border border-border bg-white text-charcoal"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle Navigation Menu"
          data-testid="mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden border-b border-border bg-ivory px-4 pt-3 pb-6 space-y-3"
          data-testid="mobile-nav-drawer"
        >
          <div className="flex flex-col space-y-1">
            {(user ? appLinks : publicLinks).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-medium ${
                    isActive ? "bg-sand text-forest font-semibold" : "text-charcoal hover:bg-sand/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {user && (
              <>
                <Link
                  href="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-medium text-charcoal hover:bg-sand/50"
                >
                  Notifications
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-medium text-charcoal hover:bg-sand/50"
                >
                  Settings & Privacy
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-terracotta-dark hover:bg-sand/50"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="w-full py-2.5 rounded-full border border-border bg-white text-sm font-medium text-charcoal"
              >
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-full border border-border bg-white text-sm font-medium text-charcoal"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-full bg-forest text-ivory text-sm font-medium"
                >
                  Create Profile
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
