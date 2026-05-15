export default function HiTechMapLoading() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-8" />

      <div className="text-center mb-12">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-3" />
        <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800/60 rounded mx-auto mb-2" />
        <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800/40 rounded mx-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-50 dark:bg-gray-900/70 rounded-xl border border-gray-200 dark:border-gray-800/40"
          />
        ))}
      </div>
    </main>
  );
}
