import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-800/60 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Orin Levi</p>
        <div className="flex gap-4">
          <a
            href="mailto:orinl181099@gmail.com"
            className="hover:text-gray-300 transition-colors"
          >
            צור קשר
          </a>
          <Link href="/access" className="hover:text-gray-300 transition-colors">
            התחברות
          </Link>
        </div>
      </div>
    </footer>
  );
}
