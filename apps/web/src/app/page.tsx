import { getTauCourses } from "@/lib/courses";
import { SearchBar } from "@/components/SearchBar";
import { HomeNav } from "@/components/HomeNav";
import { VisitCounter } from "@/components/VisitCounter";
import { MobileNav } from "@/components/MobileNav";
import { HomeHero } from "@/components/HomeHero";
import { UniversityPicker } from "@/components/UniversityPicker";
import { CourseCardV2 } from "@/components/CourseCardV2";
import { YearChapter } from "@/components/YearChapter";
import { FloatingMascot } from "@/components/FloatingMascot";

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

const courseIcons: Record<string, string> = {
  "discrete1": "\u{1F3B2}",
  "discrete2": "\u{1F3B2}",
  "calculus1b": "\u{1F4C8}",
  "calculus2b": "\u{1F4C8}",
  "lini1b": "\u{1F4D0}",
  "lini2b": "\u{1F4D0}",
  "cs1001": "\u{1F40D}",
  "software1": "\u{2328}\u{FE0F}",
  "data-structures": "\u{1F333}",
  "algorithms": "\u{26A1}",
  "probability": "\u{1F3B0}",
  "computer-architecture": "\u{1F5A5}\u{FE0F}",
  "software-project": "\u{1F6E0}\u{FE0F}",
  "computational-models": "\u{1F916}",
  "operating-systems": "\u{2699}\u{FE0F}",
  "computational-brain-workshop": "\u{1F9EE}",
  "intro-computational-learning": "\u{1F4A1}",
  "intro-psychology": "\u{1F9E0}",
  "statistics1": "\u{1F4CA}",
  "statistics2": "\u{1F4CA}",
  "personality": "\u{1F3AD}",
  "developmental-psychology": "\u{1F476}",
  "research-methods": "\u{1F50D}",
  "anova": "\u{1F4C9}",
  "social-psychology": "\u{1F465}",
  "cognitive-psychology": "\u{1F4AD}",
  "experimental-psychology": "\u{1F52C}",
  "physio-psychology": "\u{1FA7A}",
  "computational-models-psychology": "\u{1F9EE}",
  "learning-conditioning": "\u{1F43E}",
  "intro-psychopathology": "\u{1FA79}",
  "social-psychology-advanced": "\u{1F91D}",
  "history-philosophy-psychology": "\u{1F4DC}",
  "neuroscience": "\u{1F9EC}",
  "intro-chemistry": "\u{2697}\u{FE0F}",
  "intro-physics": "\u{1F30C}",
  "cell-biology": "\u{1F9EB}",
  "intro-physiology": "\u{1FAC0}",
  "brain-structure": "\u{1F9E0}",
  "perception-psychophysics": "\u{1F441}\u{FE0F}",
  "neurobiology": "\u{1F52C}",
  "systems-neurobiology": "\u{1F52C}",
};

const courseQuips: Record<string, string> = {
  "discrete1": "נו אבל אינמצב שזה נחשב רק 3 ש\"ס",
  "discrete2": "עוד 3 ש\"ס של אשליות",
  "calculus1b": "ותודה לצנזור",
  "calculus2b": "צנזור ה-👑",
  "statistics1": "מי ידע שקורס של פסיכולוגיה ידרוש ככה..",
};

const yearHeaderEmoji: Record<number, string> = {
  1: "🏁🚩",
  3: "🪬🪬🪬",
};

const yearQuips: Record<number, string> = {
  1: "מישהו כאילו הבין מראש לאן אנחנו נכנסים?! 🤯",
  2: "הופהופ טרללה גדלתי בשנה, בע״ה 🪬",
};

const semesterQuips: Record<string, string> = {
  "1:A": "~לילות לבנים בסטנדרט",
  "1:B": "עברתי סמסטר ואני עדיין בחיים, דורש ~הגומל",
};

function yearLabel(year: number): string {
  if (year === 1) return "א'";
  if (year === 2) return "ב'";
  if (year === 3) return "ג'";
  return String(year);
}

export default function HomePage() {
  const courses = getTauCourses();

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

  const navData = grouped.map(({ year, semesters }) => ({
    year,
    semesters: semesters.map((s) => ({
      semester: s.semester,
      categories: s.categories.map((c) => ({
        category: c.category,
        label: categoryLabelsShort[c.category] || c.category,
        courses: c.courses.map((course) => ({ id: course.id, title: course.title })),
      })),
    })),
  }));

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 relative">
      <div className="absolute top-4 right-4 z-10">
        <VisitCounter />
      </div>

      <HomeHero courseCount={courses.length} />

      <UniversityPicker />

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

      <div className="flex gap-8 mt-12">
        {/* Sticky sidebar nav — desktop only */}
        <aside className="hidden xl:block w-44 flex-shrink-0">
          <HomeNav years={navData} />
        </aside>

        {/* Course grid */}
        <div className="flex-1 min-w-0">
          {grouped.map(({ year, semesters }) => (
            <YearChapter
              key={year}
              yearLabel={yearLabel(year)}
              emoji={yearHeaderEmoji[year]}
              quip={yearQuips[year]}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {semesters.map(({ semester, categories }) => (
                  <div
                    key={semester}
                    id={`year-${year}-sem-${semester}`}
                    className="relative rounded-2xl bg-gradient-to-b from-white/60 to-gray-50/30 dark:from-gray-900/40 dark:to-gray-950/40 backdrop-blur-sm p-6 ring-1 ring-gray-200/70 dark:ring-gray-800/60 scroll-mt-20"
                  >
                    <h3 className="text-lg font-semibold mb-5 text-gray-700 dark:text-gray-200 border-b border-gray-200/70 dark:border-gray-700/50 pb-3">
                      {semesterLabels[semester] || `סמסטר ${semester}`}
                      {semesterQuips[`${year}:${semester}`] && (
                        <span className="block text-[11px] font-normal text-gray-400 dark:text-gray-600 mt-1 italic">
                          ({semesterQuips[`${year}:${semester}`]})
                        </span>
                      )}
                    </h3>

                    <div className="space-y-6">
                      {categories.map(({ category, courses: categoryCourses }) => (
                        <div key={category}>
                          {categories.length > 1 && (
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-widest">
                              {categoryLabels[category] || category}
                            </h4>
                          )}
                          <div className="space-y-3">
                            {categoryCourses.map((course, idx) => (
                              <CourseCardV2
                                key={course.id}
                                course={course}
                                icon={courseIcons[course.id] || "\u{1F4DA}"}
                                quip={courseQuips[course.id]}
                                index={idx}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </YearChapter>
          ))}
        </div>
      </div>

      <MobileNav years={navData} />
      <FloatingMascot />
    </main>
  );
}
