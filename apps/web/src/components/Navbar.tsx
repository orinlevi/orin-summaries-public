"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AnimatedLogo } from "@/components/AnimatedLogo";

export function Navbar() {
  function handleCheckout() {
    const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
    if (!priceId || !window.Paddle) {
      window.location.href = "/access";
      return;
    }
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
    });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/60">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Right side - logo & title */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <AnimatedLogo size={32} autoRotate={false} ariaLabel="Orin Summaries" />
          <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
            Orin Summaries
          </span>
        </Link>

        {/* Left side - theme + login + purchase */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/access"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
          >
            התחברות
          </Link>
          <button
            onClick={handleCheckout}
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            רכישת גישה
          </button>
        </div>
      </div>
    </nav>
  );
}
