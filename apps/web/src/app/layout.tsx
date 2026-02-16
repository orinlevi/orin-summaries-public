import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orin Summaries | סיכומי קורסים",
  description: "סיכומי קורסים מקצועיים לסטודנטים באוניברסיטת תל אביב",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-gray-950 text-gray-100 antialiased min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <Analytics />
        <Script
          src="https://assets.lemonsqueezy.com/lemon.js"
          strategy="lazyOnload"
        />
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
