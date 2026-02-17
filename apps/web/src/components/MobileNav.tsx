"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { YearNav } from "./HomeNav";

const yearLabels: Record<number, string> = {
  1: "שנה א'",
  2: "שנה ב'",
  3: "שנה ג'",
};

const yearSideLabels: Record<number, string> = {
  1: "ready..",
  2: "set..",
  3: "go! 🎉",
};

const semLabels: Record<string, string> = {
  A: "סמ' א'",
  B: "סמ' ב'",
};

export function MobileNav({ years }: { years: YearNav[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openYears, setOpenYears] = useState<Set<number>>(new Set());
  const [openSemesters, setOpenSemesters] = useState<Set<string>>(new Set());

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function scrollTo(id: string) {
    setOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }

  function toggleYear(year: number) {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  function toggleSemester(key: string) {
    setOpenSemesters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <>
      {/* Floating hamburger button — visible only below xl */}
      <button
        onClick={() => setOpen(true)}
        className="xl:hidden fixed bottom-6 left-6 z-40 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg shadow-purple-500/30 transition-all active:scale-95"
        aria-label="תפריט ניווט"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="xl:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`xl:hidden fixed top-0 right-0 z-50 h-full w-64 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">ניווט</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            aria-label="סגור"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 overflow-y-auto h-[calc(100%-57px)] space-y-3" dir="rtl">
          {years.map(({ year, semesters }) => {
            const yearOpen = openYears.has(year);

            return (
              <div key={year}>
                <div className="flex items-center">
                  <button
                    onClick={() => toggleYear(year)}
                    className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 px-1 py-1 text-[10px]"
                    aria-label={yearOpen ? "סגור" : "פתח"}
                  >
                    <span className={`inline-block transition-transform duration-200 ${yearOpen ? "rotate-90" : ""}`}>
                      &#9654;
                    </span>
                  </button>
                  <button
                    onClick={() => scrollTo(`year-${year}`)}
                    className="flex-1 text-right pr-1 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {yearLabels[year] || `שנה ${year}`}
                    {yearSideLabels[year] && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-600 font-normal mr-1">{yearSideLabels[year]}</span>
                    )}
                  </button>
                </div>

                {yearOpen && (
                  <div className="mr-5 space-y-2 mt-1">
                    {semesters.map(({ semester, categories }) => {
                      const semKey = `${year}-${semester}`;
                      const semOpen = openSemesters.has(semKey);

                      return (
                        <div key={semester}>
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleSemester(semKey)}
                              className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 px-1 py-0.5 text-[9px]"
                              aria-label={semOpen ? "סגור" : "פתח"}
                            >
                              <span className={`inline-block transition-transform duration-200 ${semOpen ? "rotate-90" : ""}`}>
                                &#9654;
                              </span>
                            </button>
                            <button
                              onClick={() => scrollTo(`year-${year}-sem-${semester}`)}
                              className="flex-1 text-right pr-1 py-0.5 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            >
                              {semLabels[semester] || `סמ' ${semester}`}
                            </button>
                          </div>

                          {semOpen && (
                            <div className="mr-5 mt-0.5 space-y-1">
                              {categories.map(({ category, label, courses }) => (
                                <div key={category}>
                                  {categories.length > 1 && (
                                    <p className="text-[10px] text-gray-400 dark:text-gray-600 pr-2 py-0.5 font-medium">
                                      {label}
                                    </p>
                                  )}
                                  <div className="space-y-0.5">
                                    {courses.map((course) => (
                                      <button
                                        key={course.id}
                                        onClick={() => {
                                          setOpen(false);
                                          router.push(`/course/${course.id}`);
                                        }}
                                        className="block w-full text-right pr-2 py-0.5 text-[11px] text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate"
                                        title={course.title}
                                      >
                                        {course.title}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
