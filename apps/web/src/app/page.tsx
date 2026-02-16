import Image from "next/image";
import Link from "next/link";
import { getAllCourses, type Course } from "@/lib/courses";
import { SearchBar } from "@/components/SearchBar";

const categoryLabels: Record<string, string> = {
  "cs-math": "מדעי המחשב – מתמטיקה",
  psychology: "פסיכולוגיה",
  neuroscience: "מדעי המוח",
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

const accentColors: Record<string, string> = {
  purple: "border-purple-500 hover:border-purple-400",
  teal: "border-teal-500 hover:border-teal-400",
  indigo: "border-indigo-500 hover:border-indigo-400",
  cyan: "border-cyan-500 hover:border-cyan-400",
  emerald: "border-emerald-500 hover:border-emerald-400",
};

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/course/${course.id}`}
      className={`block border-r-4 ${accentColors[course.accentColor] || "border-gray-500"} bg-gray-900 rounded-lg p-6 transition-all duration-200 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20`}
    >
      <h4 className="text-xl font-semibold mb-2">
        <span className="ml-2">{courseIcons[course.id] || "\u{1F4DA}"}</span>
        {course.title}
      </h4>
      <p className="text-gray-400 text-sm mb-4">{course.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{course.units.length} יחידות</span>
        <span>{course.priceILS === 0 ? "חינם" : `${course.priceILS}₪`}</span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const courses = getAllCourses();

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
      <header className="text-center mb-16">
        <Image
          src="/logo.png"
          alt="Orin Summaries Logo"
          width={100}
          height={100}
          className="mx-auto mb-4 rounded-full"
          priority
        />
        <h1 className="text-4xl font-bold mb-2">סיכומי קורסים</h1>
        <p className="text-gray-500 text-sm mb-4">by Orin Levi</p>
        <p className="text-gray-400 text-lg">TAU &ndash; מדמ&quot;ח-פסיכו-מוח</p>
        <p className="text-gray-600 mt-3 text-sm">
          {courses.length} קורסים | 2 יחידות ראשונות בחינם בכל קורס
        </p>
      </header>

      <SearchBar
        courses={courses.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
        }))}
      />

      {grouped.map(({ year, semesters }) => (
        <section key={year} className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-200">
            שנה {year === 1 ? "א'" : year === 2 ? "ב'" : year === 3 ? "ג'" : year}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {semesters.map(({ semester, categories }) => (
              <div
                key={semester}
                className="bg-gray-900/40 rounded-xl p-6 border border-gray-800"
              >
                <h3 className="text-xl font-semibold mb-6 text-gray-300 border-b border-gray-800 pb-3">
                  {semesterLabels[semester] || `סמסטר ${semester}`}
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
    </main>
  );
}
