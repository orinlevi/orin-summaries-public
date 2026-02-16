import Image from "next/image";
import Link from "next/link";

const CHECKOUT_URL =
  "https://orin-summaries.lemonsqueezy.com/checkout/buy/32690964-5df0-44e3-997d-d7ef3e719486?embed=1";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/60">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Right side - logo & title */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Orin Summaries"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-semibold text-gray-200 text-sm">
            Orin Summaries
          </span>
        </Link>

        {/* Left side - login + purchase */}
        <div className="flex items-center gap-3">
          <Link
            href="/access"
            className="text-gray-400 hover:text-gray-200 text-sm transition-colors"
          >
            התחברות
          </Link>
          <a
            href={CHECKOUT_URL}
            className="lemonsqueezy-button bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            רכישת גישה
          </a>
        </div>
      </div>
    </nav>
  );
}
