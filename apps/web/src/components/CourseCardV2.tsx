import Link from "next/link";
import type { Course } from "@/lib/courses";

interface CourseCardV2Props {
  course: Course;
  icon: string;
  quip?: string;
  index?: number;
}

const ACCENT_TOKENS: Record<string, {
  glow: string;
  ring: string;
  emojiBg: string;
  bar: string;
  unitText: string;
}> = {
  purple: {
    glow: "from-purple-400/0 via-purple-400/40 to-pink-400/50 dark:from-purple-500/0 dark:via-purple-500/30 dark:to-pink-500/40",
    ring: "group-hover:ring-purple-400 dark:group-hover:ring-purple-500",
    emojiBg: "from-purple-200 to-pink-200 dark:from-purple-800/60 dark:to-pink-800/60",
    bar: "bg-gradient-to-b from-purple-500 to-pink-500",
    unitText: "text-purple-600 dark:text-purple-300",
  },
  teal: {
    glow: "from-teal-400/0 via-teal-400/40 to-emerald-400/50 dark:from-teal-500/0 dark:via-teal-500/30 dark:to-emerald-500/40",
    ring: "group-hover:ring-teal-400 dark:group-hover:ring-teal-500",
    emojiBg: "from-teal-200 to-emerald-200 dark:from-teal-800/60 dark:to-emerald-800/60",
    bar: "bg-gradient-to-b from-teal-500 to-emerald-500",
    unitText: "text-teal-600 dark:text-teal-300",
  },
  indigo: {
    glow: "from-indigo-400/0 via-indigo-400/40 to-blue-400/50 dark:from-indigo-500/0 dark:via-indigo-500/30 dark:to-blue-500/40",
    ring: "group-hover:ring-indigo-400 dark:group-hover:ring-indigo-500",
    emojiBg: "from-indigo-200 to-blue-200 dark:from-indigo-800/60 dark:to-blue-800/60",
    bar: "bg-gradient-to-b from-indigo-500 to-blue-500",
    unitText: "text-indigo-600 dark:text-indigo-300",
  },
  cyan: {
    glow: "from-cyan-400/0 via-cyan-400/40 to-blue-400/50 dark:from-cyan-500/0 dark:via-cyan-500/30 dark:to-blue-500/40",
    ring: "group-hover:ring-cyan-400 dark:group-hover:ring-cyan-500",
    emojiBg: "from-cyan-200 to-blue-200 dark:from-cyan-800/60 dark:to-blue-800/60",
    bar: "bg-gradient-to-b from-cyan-500 to-blue-500",
    unitText: "text-cyan-600 dark:text-cyan-300",
  },
  emerald: {
    glow: "from-emerald-400/0 via-emerald-400/40 to-teal-400/50 dark:from-emerald-500/0 dark:via-emerald-500/30 dark:to-teal-500/40",
    ring: "group-hover:ring-emerald-400 dark:group-hover:ring-emerald-500",
    emojiBg: "from-emerald-200 to-teal-200 dark:from-emerald-800/60 dark:to-teal-800/60",
    bar: "bg-gradient-to-b from-emerald-500 to-teal-500",
    unitText: "text-emerald-600 dark:text-emerald-300",
  },
};

const DEFAULT_TOKENS = {
  glow: "from-gray-300/0 via-gray-300/30 to-gray-400/40 dark:from-gray-500/0 dark:via-gray-500/20 dark:to-gray-500/30",
  ring: "group-hover:ring-gray-400 dark:group-hover:ring-gray-500",
  emojiBg: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
  bar: "bg-gradient-to-b from-gray-400 to-gray-500",
  unitText: "text-gray-600 dark:text-gray-400",
};

export function CourseCardV2({ course, icon, quip }: CourseCardV2Props) {
  const tokens = ACCENT_TOKENS[course.accentColor] || DEFAULT_TOKENS;

  return (
    <div>
      <Link
        href={`/course/${course.id}`}
        className={`group relative block rounded-2xl bg-white/80 dark:bg-gray-900/70 ring-1 ring-gray-200 dark:ring-gray-800 ${tokens.ring} p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/50 backdrop-blur-sm`}
      >
        {/* Accent bar on the right (RTL leading edge) */}
        <div className={`absolute top-0 right-0 bottom-0 w-1 ${tokens.bar} opacity-80`} aria-hidden />

        {/* Hover glow */}
        <div
          aria-hidden
          className={`absolute -inset-px bg-gradient-to-br ${tokens.glow} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10`}
        />

        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${tokens.emojiBg} flex items-center justify-center text-3xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {course.title}
              </h4>
              {course.priceILS === 0 && (
                <span className="flex-shrink-0 text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  free
                </span>
              )}
            </div>
            {quip && (
              <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1 italic">
                ({quip})
              </p>
            )}
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-4 mb-4 line-clamp-2 leading-relaxed">
          {course.description}
        </p>

        <div className="flex justify-between items-center text-xs">
          <span className={`font-semibold ${tokens.unitText}`}>
            {course.units.length} יחידות
          </span>
          <span className={`${tokens.unitText} opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-base font-semibold`}>
            ←
          </span>
        </div>
      </Link>
    </div>
  );
}
