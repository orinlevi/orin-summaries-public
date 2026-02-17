"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

interface Props {
  courseId: string;
  unitId: number;
  unitIndex: number;
  totalUnits: number;
}

/** Completion quips by progress tier */
const completionQuips = {
  first: [
    "אחד מאיתנו",
    "התחלנו. אין דרך חזרה",
    "יחידה ראשונה? יש תקווה",
  ],
  early: [
    "באמצע כזה... כמה עוד?",
    "סעמק, ממשיכים",
    "זה מתחיל להיות רציני",
    "עוד קצת ואפשר להגיד שלמדנו",
  ],
  mid: [
    "חצי קורס, חצי נשמה",
    "עברנו את האמצע, אין דרך חזרה",
    "כבר יותר מחצי! (אבל עדיין מרגיש כמו התחלה)",
  ],
  late: [
    "עוד קצת ודי!",
    "הסוף נראה מפה",
    "כמעט שם... (זה מה שאמרתי גם ביחידה הקודמת)",
    "ספרינט אחרון!",
  ],
  last: [
    "סיימנו?! סיימנו. 🎉",
    "זהו. נגמר הסיוט. (עד הקורס הבא)",
    "מזל טוב, עכשיו לך תישן",
    "וזהו, עפנו מהקורס הזה 🫡",
  ],
};

function getCompletionQuip(unitIndex: number, totalUnits: number): string {
  const progress = (unitIndex + 1) / totalUnits;
  const isFirst = unitIndex === 0;
  const isLast = unitIndex === totalUnits - 1;

  let pool: string[];
  if (isLast) pool = completionQuips.last;
  else if (isFirst) pool = completionQuips.first;
  else if (progress <= 0.35) pool = completionQuips.early;
  else if (progress <= 0.65) pool = completionQuips.mid;
  else pool = completionQuips.late;

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Client component that:
 * 1. Auto-marks the unit as "viewed" on mount (fire-and-forget)
 * 2. Shows a toggle button for marking/unmarking completion (like a checkbox)
 *
 * Only renders for logged-in users.
 */
export function UnitProgress({ courseId, unitId, unitIndex, totalUnits }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);

  const quip = useMemo(
    () => getCompletionQuip(unitIndex, totalUnits),
    [unitIndex, totalUnits]
  );

  // Check auth + fetch current progress
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const authRes = await fetch("/api/auth/check");
        if (!authRes.ok) {
          setLoading(false);
          return;
        }

        if (cancelled) return;
        setIsLoggedIn(true);

        // Fire mark-viewed (fire-and-forget)
        fetch("/api/progress/mark-viewed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, unitId }),
        }).catch(() => {});

        // Fetch current progress to check if already completed
        const progressRes = await fetch(`/api/progress/${courseId}`);
        if (progressRes.ok) {
          const data = await progressRes.json();
          if (!cancelled) {
            setIsCompleted(data.completed?.includes(unitId) ?? false);
          }
        }
      } catch {
        // Silently fail — no progress tracking is not critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [courseId, unitId]);

  const handleToggle = useCallback(async () => {
    if (toggling) return;
    setToggling(true);

    const wasCompleted = isCompleted;

    // Optimistic update
    setIsCompleted(!wasCompleted);
    if (!wasCompleted) setJustCompleted(true);
    else setJustCompleted(false);

    try {
      const endpoint = wasCompleted
        ? "/api/progress/undo-complete"
        : "/api/progress/mark-complete";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, unitId }),
      });

      if (!res.ok) {
        // Revert on error
        setIsCompleted(wasCompleted);
        setJustCompleted(false);
      }
    } catch {
      // Revert on error
      setIsCompleted(wasCompleted);
      setJustCompleted(false);
    } finally {
      setToggling(false);
    }
  }, [courseId, unitId, isCompleted, toggling]);

  // Don't render anything for non-logged-in users or while loading
  if (loading || !isLoggedIn) return null;

  return (
    <div className="mt-8 flex flex-col items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isCompleted
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700"
            : "bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700"
        }`}
      >
        {isCompleted ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            סיימתי
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" />
            </svg>
            סיימתי את היחידה
          </>
        )}
      </button>
      {justCompleted && (
        <p className="text-[11px] text-gray-400 dark:text-gray-600 animate-fade-in">
          {quip}
        </p>
      )}
    </div>
  );
}
