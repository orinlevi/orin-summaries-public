import type { Metadata } from "next";
import Script from "next/script";
import { Heebo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: {
    default: "Orin Summaries | סיכומי קורסים",
    template: "%s | Orin Summaries",
  },
  description: "סיכומי קורסים מקצועיים לסטודנטים באוניברסיטת תל אביב — מדמ\"ח, פסיכולוגיה, מדעי המוח",
  metadataBase: new URL("https://orin-summaries.vercel.app"),
  openGraph: {
    title: "Orin Summaries | סיכומי קורסים",
    description: "סיכומי קורסים מקצועיים לסטודנטים באוניברסיטת תל אביב",
    url: "https://orin-summaries.vercel.app",
    siteName: "Orin Summaries",
    locale: "he_IL",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Orin Summaries Logo" }],
  },
  twitter: {
    card: "summary",
    title: "Orin Summaries | סיכומי קורסים",
    description: "סיכומי קורסים מקצועיים — TAU מדמ\"ח-פסיכו-מוח",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');var d=document.documentElement;if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){d.classList.add('dark')}})()` }} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${heebo.variable} font-sans bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased min-h-screen flex flex-col`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[100] focus:bg-purple-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
        >
          דלג לתוכן
        </a>
        <Navbar />
        <div className="flex-1" id="main-content">{children}</div>
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
