"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function AccessPage() {
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponEmail, setCouponEmail] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /* ── Google Sign-In ───────────────────────────────── */

  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      setError("");
      setGoogleLoading(true);

      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });

        if (res.ok) {
          router.push("/?activated=1");
        } else if (res.status === 404) {
          setError(
            "לא נמצאה רכישה עבור חשבון Google זה. ודאו שזו הכתובת שבה השתמשתם בעת הרכישה."
          );
        } else if (res.status === 401) {
          setError("אימות Google נכשל. נסו שוב.");
        } else {
          setError("אירעה שגיאה בשרת. נסו שוב מאוחר יותר.");
        }
      } catch {
        setError("שגיאת רשת. ודאו שיש חיבור לאינטרנט ונסו שוב.");
      } finally {
        setGoogleLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "undefined") return;

    const initGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        ux_mode: "popup",
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "signin_with",
        locale: "he",
      });

      setGoogleReady(true);
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        }
      }, 200);
      const timeout = setTimeout(() => clearInterval(interval), 10000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [handleGoogleResponse]);

  /* ── Coupon ────────────────────────────────────────── */

  async function handleCouponSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCouponLoading(true);

    try {
      const res = await fetch("/api/auth/redeem-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), email: couponEmail.trim() }),
      });

      if (res.ok) {
        router.push("/?activated=1");
      } else if (res.status === 404) {
        setError("קוד קופון לא תקין.");
      } else if (res.status === 410) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error === "coupon_expired"
            ? "הקופון פג תוקף."
            : "הקופון מוצה (נוצל מספר הפעמים המרבי)."
        );
      } else {
        setError("אירעה שגיאה. נסו שוב מאוחר יותר.");
      }
    } catch {
      setError("שגיאת רשת. ודאו שיש חיבור לאינטרנט ונסו שוב.");
    } finally {
      setCouponLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">התחברות</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          היכנסו כדי לגשת לתכנים שרכשתם
        </p>
      </div>

      {/* Google Sign-In */}
      <div className={googleReady ? "" : "overflow-hidden h-0 opacity-0"}>
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800/60">
          <div className="flex justify-center" dir="ltr">
            <div ref={googleButtonRef} />
          </div>
          {googleLoading && (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-3 animate-pulse">
              מאמת...
            </p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-3">
          <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 my-8">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        <span className="text-gray-400 dark:text-gray-600 text-xs">אפשרויות נוספות</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Coupon section */}
      <div>
        <button
          type="button"
          onClick={() => setCouponOpen(!couponOpen)}
          className="w-full text-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm transition-colors py-2"
        >
          {couponOpen ? "הסתר קוד קופון" : "יש לי קוד קופון"}
        </button>

        {couponOpen && (
          <form onSubmit={handleCouponSubmit} className="space-y-3 mt-4">
            <input
              type="email"
              required
              value={couponEmail}
              onChange={(e) => setCouponEmail(e.target.value)}
              placeholder="your@email.com"
              dir="ltr"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
            />
            <input
              type="text"
              required
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="קוד קופון"
              dir="ltr"
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={couponLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors text-sm"
            >
              {couponLoading ? "בודק..." : "מימוש קופון"}
            </button>
          </form>
        )}
      </div>

      {/* Footer links */}
      <p className="text-gray-400 dark:text-gray-600 text-xs text-center mt-10">
        עדיין לא רכשתם?{" "}
        <a href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline">
          חזרה לדף הבית
        </a>
      </p>
    </main>
  );
}
