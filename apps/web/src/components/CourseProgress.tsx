"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ProgressData {
  viewed: number[];
  completed: number[];
}

interface ProgressState {
  progress: ProgressData | null;
  /** null = loading, true = has access, false = no access */
  hasAccess: boolean | null;
}

type UnitState = "completed" | "viewed" | "none";

const ProgressContext = createContext<ProgressState>({ progress: null, hasAccess: null });

interface ProviderProps {
  courseId: string;
  children: ReactNode;
}

/**
 * Context provider that fetches course progress for logged-in users.
 * Wrap the course page's unit list with this so child UnitStatusIcon
 * components can read individual unit statuses.
 */
export function CourseProgressProvider({ courseId, children }: ProviderProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const authRes = await fetch("/api/auth/check");
        if (cancelled) return;

        if (!authRes.ok) {
          setHasAccess(false);
          return;
        }

        setHasAccess(true);

        const res = await fetch(`/api/progress/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setProgress(data);
        }
      } catch {
        if (!cancelled) setHasAccess(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [courseId]);

  return (
    <ProgressContext.Provider value={{ progress, hasAccess }}>
      {children}
    </ProgressContext.Provider>
  );
}

interface ProgressBarProps {
  totalUnits: number;
}

/**
 * Progress bar showing completed/total. Only visible when user has progress.
 */
export function CourseProgressBar({ totalUnits }: ProgressBarProps) {
  const { progress } = useContext(ProgressContext);

  if (!progress) return null;

  const completedCount = progress.completed.length;
  if (completedCount === 0) return null;

  const pct = totalUnits > 0 ? Math.round((completedCount / totalUnits) * 100) : 0;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
          {completedCount}/{totalUnits}
        </span>
      </div>
    </div>
  );
}

/**
 * Small status indicator next to each unit in the course list.
 * ✓ green = completed, ◐ blue = viewed, nothing = not started
 */
export function UnitStatusIcon({ unitId, isFree }: { unitId: number; isFree?: boolean }) {
  const { progress, hasAccess } = useContext(ProgressContext);

  // If user has progress, show progress icons
  if (progress) {
    let status: UnitState = "none";
    if (progress.completed?.includes(unitId)) {
      status = "completed";
    } else if (progress.viewed?.includes(unitId)) {
      status = "viewed";
    }

    if (status === "completed") {
      return (
        <span className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" title="הושלם">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      );
    }

    if (status === "viewed") {
      return (
        <span className="text-blue-400 dark:text-blue-500 flex-shrink-0" title="נצפה">
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
            <path d="M10 4a6 6 0 016 6h-6V4z" />
          </svg>
        </span>
      );
    }

    // Has access but unit not started — no icon
    return null;
  }

  // No progress yet — show lock status based on access + free
  if (isFree) return null; // Free units never show lock

  // Still loading auth
  if (hasAccess === null) return null;

  // User has access — no lock needed
  if (hasAccess) return null;

  // User doesn't have access and unit is not free — show lock
  return (
    <span className="text-gray-400 dark:text-gray-600 flex-shrink-0" title="דרושה גישה">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    </span>
  );
}
