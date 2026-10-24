import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCurrentNavbarUser } from "@/lib/auth/session";
import Script from "next/script";


export const metadata: Metadata = {
  title: {
    default: "SpaceSync — Somewhere out there is your perfect flatmate.",
    template: "%s | SpaceSync",
  },
  description:
    "SpaceSync helps students, MBA cohorts, and young professionals across Bangalore, Mumbai, and Delhi NCR find compatible people to live with through the transparent, rules-based Peace Score.",
  verification: {
    google: "SKSamSvWVCc2SDWole7W_1XOZ4EFU0LNUZdT7vBE-tw",
  },
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
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
