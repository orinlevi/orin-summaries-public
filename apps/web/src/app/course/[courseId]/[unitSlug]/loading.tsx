export default function UnitLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex gap-2 text-sm mb-8">
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
        <span className="text-gray-300">/</span>
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
        <span className="text-gray-300">/</span>
        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>

      <div className="space-y-4">
        <div className="h-8 w-80 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-full bg-gray-100 dark:bg-gray-800/60 rounded" />
        <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-800/60 rounded" />
        <div className="h-4 w-4/6 bg-gray-100 dark:bg-gray-800/60 rounded" />
        <div className="h-32 w-full bg-gray-50 dark:bg-gray-900/50 rounded-lg mt-6" />
        <div className="h-4 w-full bg-gray-100 dark:bg-gray-800/60 rounded" />
        <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800/60 rounded" />
      </div>
    </div>
  );
}
