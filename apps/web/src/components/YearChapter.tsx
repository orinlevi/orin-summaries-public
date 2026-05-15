import type { ReactNode } from "react";

interface YearChapterProps {
  yearLabel: string;
  emoji?: string;
  quip?: string;
  children: ReactNode;
}

export function YearChapter({ yearLabel, emoji, quip, children }: YearChapterProps) {
  return (
    <section className="mb-16 scroll-mt-20">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-l from-purple-500/40 via-pink-500/30 to-transparent" />
          <span className="px-3 inline-flex items-baseline gap-2">
            <span className="bg-gradient-to-br from-purple-700 to-pink-600 dark:from-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
              שנה {yearLabel}
            </span>
            {emoji && <span className="text-xl">{emoji}</span>}
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-purple-500/40 via-pink-500/30 to-transparent" />
        </h2>
        {quip && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-2">
            ({quip})
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
