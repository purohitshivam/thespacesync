import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCurrentNavbarUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: {
    default: "SpaceSync — Somewhere out there is your perfect flatmate.",
    template: "%s | SpaceSync",
  },
  description:
    "SpaceSync helps students, MBA cohorts, and young professionals across Bangalore, Mumbai, and Delhi NCR find compatible people to live with through the transparent, rules-based Peace Score.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentNavbarUser();

  return (
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col bg-ivory text-charcoal antialiased selection:bg-sand selection:text-forest">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
