"use client";

const CHECKOUT_URL =
  "https://orin-summaries.lemonsqueezy.com/checkout/buy/32690964-5df0-44e3-997d-d7ef3e719486?embed=1";

interface PaywallGateProps {
  courseName: string;
}

export function PaywallGate({ courseName }: PaywallGateProps) {
  return (
    <div className="mt-8 text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        <p className="text-6xl mb-4">&#128274;</p>
        <h2 className="text-xl font-bold text-gray-200 mb-3">
          תוכן זה זמין למנויים
        </h2>
        <p className="text-gray-400 mb-6">
          רכשו גישה לכל הסיכומים של {courseName} ושל כל שאר הקורסים לסמסטר.
        </p>
        <a
          href={CHECKOUT_URL}
          className="lemonsqueezy-button inline-block bg-purple-600 hover:bg-purple-500 text-white font-medium px-8 py-3 rounded-lg transition-colors"
        >
          רכישת גישה מלאה
        </a>
        <p className="text-gray-600 text-xs mt-4">
          כבר רכשתם?{" "}
          <a
            href="/access"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            התחברו כאן
          </a>
        </p>
      </div>
    </div>
  );
}
