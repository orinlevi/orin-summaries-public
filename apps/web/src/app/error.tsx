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
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">it&apos;s not us, it&apos;s the server</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        ~בקשר רעיל לסירוגין
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={reset}
          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg transition-colors"
        >
          נסו שוב
        </button>
        <a
          href="/"
          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg transition-colors"
        >
          עמוד ראשי
        </a>
      </div>
    </main>
  );
}
