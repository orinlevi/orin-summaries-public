import Link from "next/link";
import type { ReactNode } from "react";

interface UniversityCard {
  href: string;
  title: string;
  subtitle: string;
  quip: string;
  icon: ReactNode;
  accent: "purple" | "indigo" | "teal";
}

const ACCENTS: Record<UniversityCard["accent"], {
  ring: string;
  glow: string;
  text: string;
  bg: string;
  iconBg: string;
}> = {
  purple: {
    ring: "ring-purple-300/60 dark:ring-purple-700/50",
    glow: "from-purple-300/40 via-pink-300/30 to-fuchsia-300/40 dark:from-purple-600/30 dark:via-pink-600/20 dark:to-fuchsia-600/30",
    text: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50/80 dark:bg-purple-950/30",
    iconBg: "bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900/60 dark:to-pink-900/60",
  },
  indigo: {
    ring: "ring-indigo-300/60 dark:ring-indigo-700/50",
    glow: "from-indigo-300/40 via-blue-300/30 to-cyan-300/40 dark:from-indigo-600/30 dark:via-blue-600/20 dark:to-cyan-600/30",
    text: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-50/80 dark:bg-indigo-950/30",
    iconBg: "bg-gradient-to-br from-indigo-200 to-blue-200 dark:from-indigo-900/60 dark:to-blue-900/60",
  },
  teal: {
    ring: "ring-teal-300/60 dark:ring-teal-700/50",
    glow: "from-teal-300/40 via-emerald-300/30 to-cyan-300/40 dark:from-teal-600/30 dark:via-emerald-600/20 dark:to-cyan-600/30",
    text: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-50/80 dark:bg-teal-950/30",
    iconBg: "bg-gradient-to-br from-teal-200 to-emerald-200 dark:from-teal-900/60 dark:to-emerald-900/60",
  },
};

const CARDS: UniversityCard[] = [
  {
    href: "/",
    title: "TAU",
    subtitle: "מדמ\"ח · פסיכולוגיה · מוח",
    quip: "כן, זה קצת מזוכיסטי",
    icon: "🎓",
    accent: "purple",
  },
  {
    href: "/huji",
    title: "HUJI",
    subtitle: "מדמ\"ח",
    quip: "~מהגלגול הקודם שלי",
    icon: "🪬",
    accent: "indigo",
  },
  {
    href: "/hi-tech-map",
    title: "מפת הייטק",
    subtitle: "הכנה לתעשייה",
    quip: "~דברים שלמדתי תו\"כ תנועה",
    icon: "🗺️",
    accent: "teal",
  },
];

export function UniversityPicker() {
  return (
    <section className="max-w-5xl mx-auto px-2 mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {CARDS.map((card) => {
          const accent = ACCENTS[card.accent];
          return (
            <div key={card.href}>
              <Link
                href={card.href}
                className={`group relative block rounded-2xl ${accent.bg} ring-1 ${accent.ring} p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30`}
              >
                {/* Animated glow */}
                <div
                  aria-hidden
                  className={`absolute -inset-1 bg-gradient-to-br ${accent.glow} opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-10`}
                />

                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl ${accent.iconBg} flex items-center justify-center text-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                  >
                    {card.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-lg font-bold ${accent.text} leading-tight`}>
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
                      {card.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-3 leading-snug italic">
                  ({card.quip})
                </p>

                {/* Arrow hint */}
                <div className={`absolute bottom-3 left-4 ${accent.text} opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-lg`}>
                  ←
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
