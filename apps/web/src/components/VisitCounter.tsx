"use client";

import { useEffect, useState } from "react";

export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // POST always — server uses cookie to deduplicate (daily unique)
    fetch("/api/stats", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  if (count === null) return null;

  return (
    <div className="inline-flex items-center gap-1.5 bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800/40 rounded-full px-3 py-1">
      <span className="text-pink-500 dark:text-pink-400 text-xs font-semibold tabular-nums">
        {count.toLocaleString("en-US")}
      </span>
      <span className="text-pink-400 dark:text-pink-500 text-[10px]">
        visits
      </span>
    </div>
  );
}
