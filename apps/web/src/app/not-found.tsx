import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-gray-700 mb-2">404</p>
      <h1 className="text-2xl font-semibold text-gray-300 mb-4">
        העמוד לא נמצא
      </h1>
      <p className="text-gray-500 mb-8 max-w-md">
        נראה שהגעת לעמוד שלא קיים. אולי הקישור השתנה, או שהעמוד הוסר.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-colors font-medium"
      >
        &larr; חזרה לדף הבית
      </Link>
    </main>
  );
}
