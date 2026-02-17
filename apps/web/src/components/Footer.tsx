import Link from "next/link";

const footerQuips = [
  "נכתב עם ai ודמעות",
  "נכתב במקום לישון",
];

export function Footer() {
  const quip = footerQuips[Math.floor(Math.random() * footerQuips.length)];
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800/60 mt-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <p className="text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} Orin Levi</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">{quip}</p>
        </div>
        <div className="flex gap-6">
          <a
            href="mailto:orinl@mail.tau.ac.il"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            צור קשר
          </a>
          <Link href="/access" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            התחברות
          </Link>
        </div>
      </div>
    </footer>
  );
}
