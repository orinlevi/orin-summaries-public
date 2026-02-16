"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="max-w-xl mx-auto px-4 py-24 text-center" dir="rtl">
      <h1 className="text-4xl font-bold mb-4">משהו השתבש</h1>
      <p className="text-gray-400 mb-8">
        אירעה שגיאה בלתי צפויה. נסו שוב או חזרו לעמוד הראשי.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={reset}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-2 rounded-lg transition-colors"
        >
          נסו שוב
        </button>
        <a
          href="/"
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-6 py-2 rounded-lg transition-colors"
        >
          עמוד ראשי
        </a>
      </div>
    </main>
  );
}
