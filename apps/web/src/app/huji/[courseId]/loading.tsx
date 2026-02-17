export default function HujiCourseLoading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-8" />

      <div className="mb-12">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
        <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800/60 rounded mb-2" />
        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800/40 rounded" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-50 dark:bg-gray-900/70 rounded-lg border border-gray-200 dark:border-gray-800/40"
          />
        ))}
      </div>
    </main>
  );
}
