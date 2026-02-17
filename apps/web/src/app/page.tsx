import Image from "next/image";
import Link from "next/link";
import { getTauCourses, type Course } from "@/lib/courses";
import { SearchBar } from "@/components/SearchBar";
import { HomeNav } from "@/components/HomeNav";
import { VisitCounter } from "@/components/VisitCounter";
import { MobileNav } from "@/components/MobileNav";

const categoryLabels: Record<string, string> = {
  "cs-math": "מדעי המחשב – מתמטיקה",
  psychology: "פסיכולוגיה",
  neuroscience: "מדעי המוח",
};

const categoryLabelsShort: Record<string, string> = {
  "cs-math": "מדמ\"ח-מתמטיקה",
  psychology: "פסיכולוגיה",
  neuroscience: "מוח",
};

const categoryOrder = ["cs-math", "psychology", "neuroscience"];

const semesterLabels: Record<string, string> = {
  A: "סמסטר א'",
  B: "סמסטר ב'",
};

/** Course-specific emoji icons for a more inviting look */
const courseIcons: Record<string, string> = {
  // CS & Math
  "discrete1": "\u{1F3B2}",      // dice - discrete math
  "discrete2": "\u{1F3B2}",
  "calculus1b": "\u{1F4C8}",     // chart - calculus
  "calculus2b": "\u{1F4C8}",
  "lini1b": "\u{1F4D0}",        // triangular ruler - linear algebra
  "lini2b": "\u{1F4D0}",
  "cs1001": "\u{1F40D}",        // snake - Python
  "software1": "\u{2328}\u{FE0F}",  // keyboard
  "data-structures": "\u{1F333}", // tree
  "algorithms": "\u{26A1}",     // lightning
  "probability": "\u{1F3B0}",   // slot machine
  "computer-architecture": "\u{1F5A5}\u{FE0F}", // desktop
  "software-project": "\u{1F6E0}\u{FE0F}",  // tools
  "computational-models": "\u{1F916}", // robot
  "operating-systems": "\u{2699}\u{FE0F}", // gear
  "computational-brain-workshop": "\u{1F9EE}", // abacus
  "intro-computational-learning": "\u{1F4A1}", // lightbulb
  // Psychology
  "intro-psychology": "\u{1F9E0}", // brain
  "statistics1": "\u{1F4CA}",    // bar chart
  "statistics2": "\u{1F4CA}",
  "personality": "\u{1F3AD}",    // theater masks
  "developmental-psychology": "\u{1F476}", // baby
  "research-methods": "\u{1F50D}", // magnifying glass
  "anova": "\u{1F4C9}",         // chart with downward trend
  "social-psychology": "\u{1F465}", // people silhouette
  "cognitive-psychology": "\u{1F4AD}", // thought bubble
  "experimental-psychology": "\u{1F52C}", // microscope
  "physio-psychology": "\u{1FA7A}", // stethoscope
  "computational-models-psychology": "\u{1F9EE}",
  "learning-conditioning": "\u{1F43E}", // paw prints (Pavlov!)
  "intro-psychopathology": "\u{1FA79}", // adhesive bandage
  "social-psychology-advanced": "\u{1F91D}", // handshake
  "history-philosophy-psychology": "\u{1F4DC}", // scroll
  // Neuroscience
  "neuroscience": "\u{1F9EC}",   // DNA
  "intro-chemistry": "\u{2697}\u{FE0F}",  // alembic
  "intro-physics": "\u{1F30C}",  // milky way
  "cell-biology": "\u{1F9EB}",   // petri dish
  "intro-physiology": "\u{1FAC0}", // anatomical heart
  "brain-structure": "\u{1F9E0}", // brain
  "perception-psychophysics": "\u{1F441}\u{FE0F}", // eye
  "neurobiology": "\u{1F52C}",
  "systems-neurobiology": "\u{1F52C}",
};

/** Tiny cynical quips next to specific courses */
const courseQuips: Record<string, string> = {
  "discrete1": "נו אבל אינמצב שזה נחשב רק 3 ש\"ס",
  "discrete2": "עוד 3 ש\"ס של אשליות",
  "calculus1b": "ותודה לצנזור",
  "calculus2b": "צנזור ה-👑",
  "statistics1": "מי ידע שקורס של פסיכולוגיה ידרוש ככה..",
};

/** Emoji shown to the left of year header (in RTL = after the text) */
const yearHeaderEmoji: Record<number, string> = {
  1: "🏁🚩",
  3: "🪬🪬🪬",
};

/** Quips next to year headers */
const yearQuips: Record<number, string> = {
  1: "מישהו כאילו הבין מראש לאן אנחנו נכנסים?! 🤯",
  2: "הופהופ טרללה גדלתי בשנה, בע״ה 🪬",
};

/** Quips next to semester headers (key = "year:semester") */
const semesterQuips: Record<string, string> = {
  "1:A": "~לילות לבנים בסטנדרט",
  "1:B": "עברתי סמסטר ואני עדיין בחיים, דורש ~הגומל",
};

const accentColors: Record<string, { border: string; bg: string; hover: string }> = {
  purple: {
    border: "border-purple-500 hover:border-purple-400",
    bg: "bg-purple-50/60 dark:bg-gray-900/80",
    hover: "hover:bg-purple-100/50 dark:hover:bg-gray-800/90",
  },
  teal: {
    border: "border-teal-500 hover:border-teal-400",
    bg: "bg-teal-50/60 dark:bg-gray-900/80",
    hover: "hover:bg-teal-100/50 dark:hover:bg-gray-800/90",
  },
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
  emerald: {
    border: "border-emerald-500 hover:border-emerald-400",
    bg: "bg-emerald-50/60 dark:bg-gray-900/80",
    hover: "hover:bg-emerald-100/50 dark:hover:bg-gray-800/90",
  },
};

const defaultAccent = { border: "border-gray-500", bg: "bg-gray-50 dark:bg-gray-900/80", hover: "hover:bg-gray-100 dark:hover:bg-gray-800/90" };

function CourseCard({ course }: { course: Course }) {
  const accent = accentColors[course.accentColor] || defaultAccent;
  return (
    <Link
      href={`/course/${course.id}`}
      className={`block border border-gray-200 dark:border-gray-800/50 border-r-4 ${accent.border} ${accent.bg} ${accent.hover} rounded-lg p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            <span className="ml-2 text-xl">{courseIcons[course.id] || "\u{1F4DA}"}</span>
            {course.title}
          </h4>
          {courseQuips[course.id] && (
            <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-0.5 mr-1">
              ({courseQuips[course.id]})
            </p>
          )}
        </div>
        {course.priceILS === 0 && (
          <span className="text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
            free
          </span>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 mb-3 line-clamp-2">{course.description}</p>
      <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
        <span>{course.units.length} יחידות</span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const courses = getTauCourses();

  // Group: year → semester → category → courses
  const years = [...new Set(courses.map((c) => c.year))].sort();

  const grouped = years.map((year) => {
    const yearCourses = courses.filter((c) => c.year === year);
    const semesters = [...new Set(yearCourses.map((c) => c.semester))].sort();

    return {
      year,
      semesters: semesters.map((sem) => {
        const semCourses = yearCourses.filter((c) => c.semester === sem);
        const categories = categoryOrder.filter((cat) =>
          semCourses.some((c) => c.category === cat)
        );

        return {
          semester: sem,
          categories: categories.map((cat) => ({
            category: cat,
            courses: semCourses.filter((c) => c.category === cat),
          })),
        };
      }),
    };
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center mb-16 relative">
        <div className="absolute inset-0 -top-12 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.12)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0">
          <VisitCounter />
        </div>
        <div className="relative">
          <Image
            src="/logo.png"
            alt="Orin Summaries Logo"
            width={100}
            height={100}
            className="mx-auto mb-4 rounded-full ring-2 ring-purple-500/20 shadow-lg shadow-purple-500/10"
            priority
          />
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-gray-900 dark:text-gray-100">סיכומי קורסים</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-1">by Orin Levi</p>
          <p className="text-gray-300 dark:text-gray-700 text-xs mb-6">המוח שלי היה מבולגן אז התחלתי לסדר סיכומים</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 px-5 py-2.5 rounded-xl text-base font-medium transition-all border border-purple-200 dark:border-purple-800/50 shadow-sm ring-2 ring-purple-400/30"
              >
                TAU &ndash; מדמ&quot;ח-פסיכו-מוח
              </Link>
              <p className="text-gray-300 dark:text-gray-700 text-[11px] mt-1.5">(כן, זה קצת מזוכיסטי)</p>
            </div>
            <div className="text-center">
              <Link
                href="/huji"
                className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-5 py-2.5 rounded-xl text-base font-medium transition-all border border-indigo-200 dark:border-indigo-800/50 shadow-sm"
              >
                מדמ&quot;ח-HUJI
              </Link>
              <p className="text-gray-300 dark:text-gray-700 text-[11px] mt-1.5">~מהגלגול הקודם שלי</p>
            </div>
          </div>
          <p className="text-gray-400 dark:text-gray-600 text-sm mt-4">
            {courses.length} קורסים
          </p>
        </div>
      </header>

      <SearchBar
        university="tau"
        courses={courses.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          university: c.university,
        }))}
      />

      <div className="flex gap-8">
        {/* Sticky sidebar nav — desktop only */}
        <aside className="hidden xl:block w-44 flex-shrink-0">
          <HomeNav
            years={grouped.map(({ year, semesters }) => ({
              year,
              semesters: semesters.map((s) => ({
                semester: s.semester,
                categories: s.categories.map((c) => ({
                  category: c.category,
                  label: categoryLabelsShort[c.category] || c.category,
                  courses: c.courses.map((course) => ({ id: course.id, title: course.title })),
                })),
              })),
            }))}
          />
        </aside>

        {/* Course grid */}
        <div className="flex-1 min-w-0">
      {grouped.map(({ year, semesters }) => (
        <section key={year} id={`year-${year}`} className="mb-16 scroll-mt-20">
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-l from-purple-500/30 to-transparent" />
            <span>שנה {year === 1 ? "א'" : year === 2 ? "ב'" : year === 3 ? "ג'" : year}</span>
            {yearHeaderEmoji[year] && <span className="text-xl">{yearHeaderEmoji[year]}</span>}
            <span className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
          </h2>
          {yearQuips[year] ? (
            <p className="text-center text-sm text-gray-400 dark:text-gray-600 mb-8">({yearQuips[year]})</p>
          ) : (
            <div className="mb-6" />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {semesters.map(({ semester, categories }) => (
              <div
                key={semester}
                id={`year-${year}-sem-${semester}`}
                className="bg-gradient-to-b from-white/80 to-gray-50/50 dark:from-gray-900/40 dark:to-gray-900/40 rounded-xl p-6 border border-gray-200 dark:border-gray-800 scroll-mt-20"
              >
                <h3 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700/50 pb-3">
                  {semesterLabels[semester] || `סמסטר ${semester}`}
                  {semesterQuips[`${year}:${semester}`] && (
                    <span className="block text-[11px] font-normal text-gray-400 dark:text-gray-600 mt-1">
                      ({semesterQuips[`${year}:${semester}`]})
                    </span>
                  )}
                </h3>

                <div className="space-y-6">
                  {categories.map(({ category, courses: categoryCourses }) => (
                    <div key={category}>
                      {categories.length > 1 && (
                        <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
                          {categoryLabels[category] || category}
                        </h4>
                      )}
                      <div className="space-y-3">
                        {categoryCourses.map((course) => (
                          <CourseCard key={course.id} course={course} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
        </div>
      </div>

      <MobileNav
        years={grouped.map(({ year, semesters }) => ({
          year,
          semesters: semesters.map((s) => ({
            semester: s.semester,
            categories: s.categories.map((c) => ({
              category: c.category,
              label: categoryLabelsShort[c.category] || c.category,
              courses: c.courses.map((course) => ({ id: course.id, title: course.title })),
            })),
          })),
        }))}
      />
    </main>
  );
}
