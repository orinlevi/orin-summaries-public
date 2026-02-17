"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CourseNav {
  id: string;
  title: string;
}

interface CategoryNav {
  category: string;
  label: string;
  courses: CourseNav[];
}

interface SemesterNav {
  semester: string;
  categories: CategoryNav[];
}

interface YearNav {
  year: number;
  semesters: SemesterNav[];
}

export type { YearNav, SemesterNav, CategoryNav, CourseNav };

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

export function HomeNav({ years }: { years: YearNav[] }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState("");
  // Default: all collapsed
  const [openYears, setOpenYears] = useState<Set<number>>(new Set());
  const [openSemesters, setOpenSemesters] = useState<Set<string>>(new Set());

  // Track which sections the user manually toggled so we don't override them
  const [manualOverrides, setManualOverrides] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ids: string[] = [];
    for (const { year, semesters } of years) {
      ids.push(`year-${year}`);
      for (const sem of semesters) {
        ids.push(`year-${year}-sem-${sem.semester}`);
      }
    }

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    // Track all currently visible section IDs
    const visibleIds = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        }

        // Find the topmost visible element
        const topVisible = elements.find((el) => visibleIds.has(el.id));
        if (!topVisible) return;

        setActiveId(topVisible.id);

        // Determine which year/semester should be open based on scroll
        const newYears = new Set<number>();
        const newSemesters = new Set<string>();

        for (const id of visibleIds) {
          for (const { year, semesters } of years) {
            if (id === `year-${year}`) {
              newYears.add(year);
            }
            for (const sem of semesters) {
              if (id === `year-${year}-sem-${sem.semester}`) {
                newYears.add(year);
                newSemesters.add(`${year}-${sem.semester}`);
              }
            }
          }
        }

        setOpenYears(newYears);
        setOpenSemesters(newSemesters);
        // Clear manual overrides when scroll takes over
        setManualOverrides(new Set());
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [years]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  }

  function toggleYear(year: number) {
    setManualOverrides((prev) => new Set(prev).add(`year-${year}`));
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  function toggleSemester(key: string) {
    setManualOverrides((prev) => new Set(prev).add(`sem-${key}`));
    setOpenSemesters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <nav className="sticky top-20 text-sm space-y-3">
      {years.map(({ year, semesters }) => {
        const yearId = `year-${year}`;
        const isYearActive = activeId === yearId;
        const yearOpen = openYears.has(year);

        return (
          <div key={year}>
            <div className="flex items-center">
              <button
                onClick={() => toggleYear(year)}
                className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 px-1 py-1 text-[10px] transition-transform"
                aria-label={yearOpen ? "סגור" : "פתח"}
              >
                <span className={`inline-block transition-transform duration-200 ${yearOpen ? "rotate-90" : ""}`}>
                  &#9654;
                </span>
              </button>
              <button
                onClick={() => scrollTo(yearId)}
                className={`flex-1 text-right pr-1 py-1 border-r-2 transition-colors ${
                  isYearActive
                    ? "text-purple-600 dark:text-purple-400 border-purple-500 font-semibold"
                    : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
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
                  const semId = `year-${year}-sem-${semester}`;
                  const isSemActive = activeId === semId;
                  const semKey = `${year}-${semester}`;
                  const semOpen = openSemesters.has(semKey);

                  return (
                    <div key={semester}>
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleSemester(semKey)}
                          className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 px-1 py-0.5 text-[9px] transition-transform"
                          aria-label={semOpen ? "סגור" : "פתח"}
                        >
                          <span className={`inline-block transition-transform duration-200 ${semOpen ? "rotate-90" : ""}`}>
                            &#9654;
                          </span>
                        </button>
                        <button
                          onClick={() => scrollTo(semId)}
                          className={`flex-1 text-right pr-1 py-0.5 border-r-2 transition-colors text-xs ${
                            isSemActive
                              ? "text-purple-600 dark:text-purple-400 border-purple-400 font-medium"
                              : "text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-400"
                          }`}
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
                                    onClick={() => router.push(`/course/${course.id}`)}
                                    className="block w-full text-right pr-2 py-0.5 text-[10px] text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate"
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
  );
}
