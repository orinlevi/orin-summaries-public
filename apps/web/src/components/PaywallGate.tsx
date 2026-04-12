"use client";

interface PaywallGateProps {
  courseName: string;
}

export function PaywallGate({ courseName }: PaywallGateProps) {
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
    <div className="mt-8 text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        <p className="text-6xl mb-4">&#128274;</p>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
          תוכן זה זמין למנויים
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          רכשו גישה לכל הסיכומים של {courseName} ושל כל שאר הקורסים לסמסטר.
        </p>
        <p className="text-gray-400 dark:text-gray-600 text-[11px] mb-6">
          (עולה לי הון להכין אותם, בואו נחלוק בחרישות ובנטל)
        </p>
        <button
          onClick={handleCheckout}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium px-8 py-3 rounded-lg transition-colors cursor-pointer"
        >
          רכישת גישה מלאה
          <span className="text-purple-200 text-xs">~friendly price</span>
        </button>
        <p className="text-gray-400 dark:text-gray-600 text-xs mt-4">
          כבר רכשתם?{" "}
          <a
            href="/access"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 underline"
          >
            התחברו כאן
          </a>
        </p>
      </div>
    </div>
  );
}
