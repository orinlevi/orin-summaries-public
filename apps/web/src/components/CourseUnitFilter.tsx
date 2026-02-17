"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { UnitStatusIcon } from "./CourseProgress";
import { type SearchEntry, getCourseFuse, getSnippet } from "@/lib/search";
import type { FuseResult } from "fuse.js";

interface Unit {
  id: number;
  slug: string;
  title: string;
  free: boolean;
}

interface Section {
  name: string;
  items: Unit[];
}

export function CourseUnitFilter({
  courseId,
  sections,
  basePath = "/course",
}: {
  courseId: string;
  sections: Section[];
  basePath?: string;
}) {
  const [query, setQuery] = useState("");
  const [contentResults, setContentResults] = useState<FuseResult<SearchEntry>[]>([]);

  const allUnits = sections.flatMap((s) =>
    s.items.map((u) => ({ ...u, section: s.name }))
  );

  // Title-based filtering
  const titleFiltered = query.trim()
    ? allUnits.filter((u) =>
        u.title.toLowerCase().includes(query.trim().toLowerCase())
      )
    : null; // null = show normal sectioned view

  // Content-based search (debounced)
  const searchContent = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setContentResults([]);
        return;
      }
      try {
        const fuse = await getCourseFuse(courseId);
        const results = fuse.search(q, { limit: 6 });
        // Filter out results that are already shown in title matches
        const titleSlugs = new Set(
          titleFiltered?.map((u) => u.slug) ?? []
        );
        setContentResults(results.filter((r) => !titleSlugs.has(r.item.unitSlug)));
      } catch {
        setContentResults([]);
      }
    },
    [courseId, titleFiltered]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      searchContent(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, searchContent]);

  const hasContentResults = contentResults.length > 0;
  const hasTitleResults = titleFiltered !== null && titleFiltered.length > 0;

  return (
    <>
      {allUnits.length > 5 && (
        <div className="mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש יחידה או תוכן בקורס..."
            className="w-full bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-colors"
            aria-label="חיפוש יחידה או תוכן בקורס"
            dir="rtl"
          />
        </div>
      )}

      {titleFiltered ? (
        // Search mode: show title matches + content matches
        <div className="space-y-3">
          {!hasTitleResults && !hasContentResults && (
            <p className="text-gray-400 dark:text-gray-600 text-sm text-center py-4">
              לא נמצאו תוצאות
            </p>
          )}

          {/* Title matches */}
          {hasTitleResults && (
            <>
              {hasContentResults && (
                <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-wide px-1">
                  לפי כותרת
                </p>
              )}
              {titleFiltered.map((unit) => (
                <UnitLink key={unit.slug} courseId={courseId} unit={unit} basePath={basePath} />
              ))}
            </>
          )}

          {/* Content matches */}
          {hasContentResults && (
            <>
              <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-wide px-1 mt-4">
                בתוכן
              </p>
              {contentResults.map((result) => {
                const entry = result.item;
                const snippet = getSnippet(entry.text, query);
                return (
                  <Link
                    key={`content-${entry.unitSlug}`}
                    href={`${basePath}/${courseId}/${entry.unitSlug}`}
                    className="group block bg-gray-50 dark:bg-gray-900/70 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 border border-gray-200 dark:border-gray-800/40"
                  >
                    <p className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-sm">
                      {entry.unitTitle}
                    </p>
                    {snippet && (
                      <p className="text-gray-400 dark:text-gray-600 text-[11px] mt-1 line-clamp-1" dir="rtl">
                        ...{snippet}...
                      </p>
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </div>
      ) : (
        // Normal sectioned view
        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.name}>
              {sections.length > 1 && (
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">
                  {section.name}
                </h2>
              )}
              <div className="space-y-3">
                {section.items.map((unit) => (
                  <UnitLink key={unit.slug} courseId={courseId} unit={unit} basePath={basePath} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function UnitLink({ courseId, unit, basePath = "/course" }: { courseId: string; unit: Unit; basePath?: string }) {
  return (
    <Link
      href={`${basePath}/${courseId}/${unit.slug}`}
      className="group flex items-center justify-between bg-gray-50 dark:bg-gray-900/70 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20 border border-gray-200 dark:border-gray-800/40"
    >
      <div className="flex items-center gap-3">
        <UnitStatusIcon unitId={unit.id} isFree={unit.free} />
        <span className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 font-mono text-xs bg-gray-100 dark:bg-gray-800/60 rounded px-2 py-1 min-w-[2rem] text-center transition-colors">
          {String(unit.id).padStart(2, "0")}
        </span>
        <span className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          {unit.title}
        </span>
      </div>
      {unit.free && (
        <span className="text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
          free
        </span>
      )}
    </Link>
  );
}
