import { AnimatedLogo } from "./AnimatedLogo";

interface HomeHeroProps {
  courseCount: number;
}

/* Ambient drifting emojis in the background. Pure CSS animation — safe if JS is slow. */
const BG_EMOJIS = [
  { e: "🐥", top: "12%", left: "8%", size: "text-3xl", anim: "float-slow", delay: "0s" },
  { e: "🌸", top: "20%", right: "10%", size: "text-2xl", anim: "float-medium", delay: "0.5s" },
  { e: "🦋", top: "40%", left: "4%", size: "text-2xl", anim: "drift", delay: "1s" },
  { e: "✨", top: "8%", right: "20%", size: "text-xl", anim: "float-slow", delay: "1.5s" },
  { e: "💜", bottom: "20%", right: "8%", size: "text-2xl", anim: "float-medium", delay: "2s" },
  { e: "🌷", bottom: "30%", left: "10%", size: "text-xl", anim: "drift", delay: "2.5s" },
  { e: "🪐", top: "55%", right: "5%", size: "text-2xl", anim: "float-slow", delay: "0.3s" },
  { e: "🌙", top: "70%", left: "15%", size: "text-xl", anim: "float-medium", delay: "1.2s" },
];

export function HomeHero({ courseCount }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-20 sm:pb-28 -mx-4 px-4">
      {/* Gradient blob backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full bg-purple-300/40 dark:bg-purple-600/20 blur-3xl" />
        <div className="absolute top-20 left-1/4 w-[28rem] h-[28rem] rounded-full bg-pink-300/40 dark:bg-pink-600/20 blur-3xl" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] rounded-full bg-indigo-300/30 dark:bg-indigo-600/15 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-amber-200/30 dark:bg-amber-500/10 blur-3xl" />
      </div>

      {/* Ambient floating emojis */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none select-none">
        {BG_EMOJIS.map((e, i) => (
          <span
            key={i}
            className={`absolute ${e.size} ${e.anim} opacity-60 dark:opacity-40`}
            style={{
              top: e.top,
              left: e.left,
              right: e.right,
              bottom: e.bottom,
              animationDelay: e.delay,
            }}
          >
            {e.e}
          </span>
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <AnimatedLogo size={160} />
        </div>

        <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-none mb-4 bg-gradient-to-br from-purple-700 via-pink-600 to-indigo-700 dark:from-purple-300 dark:via-pink-300 dark:to-indigo-300 bg-clip-text text-transparent">
          סיכומי קורסים
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 tracking-wide">
          by Orin Levi
        </p>

        <p className="text-gray-700 dark:text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-light">
          המוח שלי היה מבולגן אז התחלתי לסדר סיכומים
        </p>

        <div className="mt-10 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{courseCount}</span>
            <span>קורסים</span>
          </div>
          <span className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>חי ובועט</span>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="mt-14 flex justify-center">
          <div className="inline-flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] tracking-widest uppercase">scroll</span>
            <span className="text-xl animate-bounce">↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
