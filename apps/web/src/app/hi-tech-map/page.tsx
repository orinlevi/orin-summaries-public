import Link from "next/link";
import { getCourseById } from "@/lib/courses";
import { SearchBar } from "@/components/SearchBar";

const accentColors: Record<string, { border: string; bg: string; hover: string; text: string }> = {
  teal:    { border: "border-teal-200 dark:border-teal-900",    bg: "bg-teal-50/50 dark:bg-teal-950/30",    hover: "hover:border-teal-400 dark:hover:border-teal-700",    text: "text-teal-600 dark:text-teal-400" },
  cyan:    { border: "border-cyan-200 dark:border-cyan-900",    bg: "bg-cyan-50/50 dark:bg-cyan-950/30",    hover: "hover:border-cyan-400 dark:hover:border-cyan-700",    text: "text-cyan-600 dark:text-cyan-400" },
  emerald: { border: "border-emerald-200 dark:border-emerald-900", bg: "bg-emerald-50/50 dark:bg-emerald-950/30", hover: "hover:border-emerald-400 dark:hover:border-emerald-700", text: "text-emerald-600 dark:text-emerald-400" },
  blue:    { border: "border-blue-200 dark:border-blue-900",    bg: "bg-blue-50/50 dark:bg-blue-950/30",    hover: "hover:border-blue-400 dark:hover:border-blue-700",    text: "text-blue-600 dark:text-blue-400" },
  purple:  { border: "border-purple-200 dark:border-purple-900",  bg: "bg-purple-50/50 dark:bg-purple-950/30",  hover: "hover:border-purple-400 dark:hover:border-purple-700",  text: "text-purple-600 dark:text-purple-400" },
  amber:   { border: "border-amber-200 dark:border-amber-900",   bg: "bg-amber-50/50 dark:bg-amber-950/30",   hover: "hover:border-amber-400 dark:hover:border-amber-700",   text: "text-amber-600 dark:text-amber-400" },
  rose:    { border: "border-rose-200 dark:border-rose-900",    bg: "bg-rose-50/50 dark:bg-rose-950/30",    hover: "hover:border-rose-400 dark:hover:border-rose-700",    text: "text-rose-600 dark:text-rose-400" },
  indigo:  { border: "border-indigo-200 dark:border-indigo-900",  bg: "bg-indigo-50/50 dark:bg-indigo-950/30",  hover: "hover:border-indigo-400 dark:hover:border-indigo-700",  text: "text-indigo-600 dark:text-indigo-400" },
  red:     { border: "border-red-200 dark:border-red-900",     bg: "bg-red-50/50 dark:bg-red-950/30",     hover: "hover:border-red-400 dark:hover:border-red-700",     text: "text-red-600 dark:text-red-400" },
  sky:     { border: "border-sky-200 dark:border-sky-900",     bg: "bg-sky-50/50 dark:bg-sky-950/30",     hover: "hover:border-sky-400 dark:hover:border-sky-700",     text: "text-sky-600 dark:text-sky-400" },
  pink:    { border: "border-pink-200 dark:border-pink-900",    bg: "bg-pink-50/50 dark:bg-pink-950/30",    hover: "hover:border-pink-400 dark:hover:border-pink-700",    text: "text-pink-600 dark:text-pink-400" },
};

const defaultAccent = accentColors.teal;

/** Map section name emoji+title → color (based on original hi_tech_map sections.json) */
const sectionColors: Record<string, string> = {
  "🌍 תמונה גדולה": "teal",
  "⚡ אלגוריתמיקה": "cyan",
  "🧠 ליבת ML": "emerald",
  "🌐 רשתות ותקשורת": "blue",
  "🖥️ מערכות ותשתיות": "purple",
  "🔒 אבטחת מידע": "amber",
  "🗄️ נתונים ומסדי נתונים": "rose",
  "🌐 Full-Stack Development": "indigo",
  "⚔️ Offensive Security": "red",
  "☁️ Cloud & DevOps": "sky",
  "🚀 קריירה בהייטק": "pink",
  "🤖 ML + Red Team": "red",
  "🧬 נוירומדע ו-AI": "emerald",
  "🔒 פנקס מחקר אישי": "amber",
};

export const metadata = {
  title: "מפת הייטק | Orin Summaries",
  description: "מפת ידע מקיפה לעולם ההייטק — 79 נושאים ב-13 מדורים",
};

export default function HiTechMapPage() {
  const course = getCourseById("hi-tech-map");
  if (!course) return null;

  const totalUnits = course.units.length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm mb-8 inline-block"
      >
        &larr; חזרה לסיכומים
      </Link>

      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🗺️ מפת הייטק
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          מפת ידע מקיפה לעולם ההייטק — מ-AI ו-Machine Learning, דרך רשתות ומערכות, ועד אבטחת מידע ומסדי נתונים.
        </p>
        <div className="flex justify-center gap-8 mt-6 text-sm text-gray-500 dark:text-gray-400">
          <span><strong className="text-teal-600 dark:text-teal-400">{course.sections.length}</strong> מדורים</span>
          <span><strong className="text-teal-600 dark:text-teal-400">{totalUnits}</strong> נושאים</span>
        </div>
      </div>

      {/* Explainer */}
      <div className="max-w-3xl mx-auto mb-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">מה יש כאן ואיך משתמשים?</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>
            <strong className="text-gray-800 dark:text-gray-200">המפה הזו מתאימה לכל סטודנט/ית למדעי המחשב</strong> ולכל מי שרוצה להבין את עולם הטכנולוגיה לעומק — מ-AI ולמידת מכונה, דרך אבטחת מידע, ועד נוירומדע חישובי.
          </p>
          <p>
            כל נושא מכיל הסבר ברור עם דוגמאות קוד, אנלוגיות מהעולם האמיתי, טעויות נפוצות שכדאי להימנע מהן, ובסוף — <strong className="text-gray-800 dark:text-gray-200">שאלות לראיונות עבודה</strong> עם תשובות מפורטות.
          </p>
          <p>
            בנוסף, בכל דף יש מסלול למידה עצמית, קישורים לנושאים קשורים, והמלצות לקורסים ספציפיים מתוכנית הלימודים הדו-חוגית במדמ&quot;ח + פסיכולוגיה + מדעי המוח ב-TAU.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-3 py-1">💼 שאלות ראיון בכל דף</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1">🎓 קורסים מתוכנית TAU</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1">🛤️ מסלול למידה עצמית</span>
        </div>
      </div>

      <SearchBar
        university="hi-tech-map"
        courses={[{
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          university: course.university,
        }]}
      />

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {course.sections.map((section) => {
          const colorName = sectionColors[section.name] || "teal";
          const accent = accentColors[colorName] || defaultAccent;
          // Extract emoji from section name (first character/emoji)
          const emojiMatch = section.name.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
          const emoji = emojiMatch ? emojiMatch[0] : "";
          const title = emoji ? section.name.slice(emoji.length).trim() : section.name;

          return (
            <div
              key={section.name}
              className={`rounded-xl border ${accent.border} ${accent.bg} p-5 transition-all duration-200 ${accent.hover} hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{emoji}</span>
                <h2 className={`font-bold ${accent.text}`}>{title}</h2>
              </div>
              <ul className="space-y-1.5">
                {section.items.map((unit) => (
                  <li key={unit.slug}>
                    <Link
                      href={`/hi-tech-map/${unit.slug}`}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      {unit.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">
                {section.items.length} נושאים
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
