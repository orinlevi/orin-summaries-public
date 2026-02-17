import Link from "next/link";
import { getHujiCourses, type Course } from "@/lib/courses";
import { SearchBar } from "@/components/SearchBar";

const courseIcons: Record<string, string> = {
  "huji-lini": "\u{1F4D0}",       // triangular ruler
  "huji-discrete": "\u{1F3B2}",   // dice
  "huji-dast": "\u{1F333}",       // tree
  "huji-intro": "\u{1F40D}",      // snake (Python)
  "huji-cpp": "\u{2328}\u{FE0F}", // keyboard
};

const accentColors: Record<string, { border: string; bg: string; hover: string }> = {
  indigo: {
    border: "border-indigo-500 hover:border-indigo-400",
    bg: "bg-indigo-50/60 dark:bg-gray-900/80",
    hover: "hover:bg-indigo-100/50 dark:hover:bg-gray-800/90",
  },
  cyan: {
    border: "border-cyan-500 hover:border-cyan-400",
    bg: "bg-cyan-50/60 dark:bg-gray-900/80",
    hover: "hover:bg-cyan-100/50 dark:hover:bg-gray-800/90",
  },
  teal: {
    border: "border-teal-500 hover:border-teal-400",
    bg: "bg-teal-50/60 dark:bg-gray-900/80",
    hover: "hover:bg-teal-100/50 dark:hover:bg-gray-800/90",
  },
};

const defaultAccent = {
  border: "border-gray-500",
  bg: "bg-gray-50 dark:bg-gray-900/80",
  hover: "hover:bg-gray-100 dark:hover:bg-gray-800/90",
};

function HujiCourseCard({ course }: { course: Course }) {
  const accent = accentColors[course.accentColor] || defaultAccent;
  return (
    <Link
      href={`/huji/${course.id}`}
      className={`block border border-gray-200 dark:border-gray-800/50 border-r-4 ${accent.border} ${accent.bg} ${accent.hover} rounded-lg p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            <span className="ml-2 text-xl">{courseIcons[course.id] || "\u{1F4DA}"}</span>
            {course.title}
          </h3>
        </div>
        <span className="text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
          free
        </span>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 mb-3 line-clamp-2">
        {course.description}
      </p>
      <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
        <span>{course.units.length} יחידות</span>
      </div>
    </Link>
  );
}

export default function HujiPage() {
  const courses = getHujiCourses();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm mb-8 inline-block"
      >
        &larr; חזרה ל-TAU
      </Link>

      <header className="text-center mb-12">
        <div className="absolute inset-0 -top-12 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.12)_0%,_transparent_70%)] pointer-events-none" />
        <h1 className="text-3xl font-extrabold mb-2 tracking-tight text-gray-900 dark:text-gray-100">
          🏛️ HUJI — מדעי המחשב
        </h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-1">
          האוניברסיטה העברית בירושלים
        </p>
        <p className="text-gray-300 dark:text-gray-700 text-xs mb-4">
          כי אוניברסיטה אחת זה לא מספיק בשביל להתלונן
        </p>
        <p className="text-gray-400 dark:text-gray-600 mt-3 text-sm">
          {courses.length} קורסים
        </p>
      </header>

      <SearchBar
        university="huji"
        courses={courses.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          university: c.university,
        }))}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <HujiCourseCard key={course.id} course={course} />
        ))}
      </div>

      {courses.length === 0 && (
        <p className="text-center text-gray-400 dark:text-gray-600 mt-8">
          עוד לא הוספתי קורסים מ-HUJI... בקרוב!
        </p>
      )}
    </main>
  );
}
