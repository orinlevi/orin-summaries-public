import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById, getTauCourses } from "@/lib/courses";
import { AdminDownloads } from "@/components/AdminDownloads";
import { CourseProgressProvider, CourseProgressBar } from "@/components/CourseProgress";
import { CourseUnitFilter } from "@/components/CourseUnitFilter";

/** Wrap a public asset path with the download API so the file is served
 *  through the auth-checked route instead of being publicly accessible. */
function downloadUrl(filePath: string): string {
  return `/api/download?file=${encodeURIComponent(filePath)}`;
}

interface Props {
  params: Promise<{ courseId: string }>;
}

export async function generateStaticParams() {
  return getTauCourses().map((course) => ({ courseId: course.id }));
}

export async function generateMetadata({ params }: Props) {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course) return {};
  return {
    title: `${course.title} | Orin Summaries`,
    description: course.description,
  };
}

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course) notFound();

  const totalItems = course.units.length;
  const freeCount = course.units.filter((u) => u.free).length;

  // Public downloadables (visible to everyone)
  const publicDownloadables = course.downloadables.filter((dl) => !dl.adminOnly);
  // Admin-only downloadables (rendered client-side after auth check)
  const adminDownloadables = course.downloadables.filter((dl) => dl.adminOnly);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm mb-8 inline-block"
      >
        &larr; חזרה לקורסים
      </Link>

      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{course.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{course.description}</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          {totalItems} פריטים
        </p>
      </header>

      <CourseProgressProvider courseId={course.id}>
        <CourseProgressBar totalUnits={totalItems} />

      {/* קבצים להורדה */}
      {(publicDownloadables.length > 0 || adminDownloadables.length > 0) && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            &#128196; קבצים להורדה
          </h2>
          <div className="flex flex-wrap gap-3">
            {publicDownloadables.map((dl) => (
              <a
                key={dl.file}
                href={dl.free ? dl.file : downloadUrl(dl.file)}
                download
                className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {dl.title}
                {dl.free && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">
                    free
                  </span>
                )}
              </a>
            ))}
            <AdminDownloads items={adminDownloadables} />
          </div>
        </div>
      )}

      {/* מחברות Jupyter */}
      {course.notebooks.length > 0 && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-indigo-200 dark:border-indigo-900/50">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            &#128211; מחברות Jupyter
          </h2>
          <div className="space-y-2">
            {course.notebooks.map((nb) => (
              <div
                key={nb.file}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3"
              >
                <span className="text-gray-700 dark:text-gray-300 text-sm">{nb.title}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={downloadUrl(nb.file)}
                    download
                    className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded transition-colors"
                  >
                    &#11015; הורדה
                  </a>
                  <a
                    href={nb.colab}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded transition-colors"
                  >
                    &#9654; Colab
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* קבצי קוד */}
      {course.codeFiles.length > 0 && (
        <div className="mb-10 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            &#128187; קבצי Python
          </h2>
          <div className="flex flex-wrap gap-2">
            {course.codeFiles.map((cf) => (
              <a
                key={cf.file}
                href={downloadUrl(cf.file)}
                download
                className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 px-3 py-1.5 rounded text-xs transition-colors"
              >
                <span className="text-emerald-600 dark:text-emerald-500 font-mono">.py</span>
                {cf.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* סיכומים ויחידות */}
      <CourseUnitFilter
        courseId={course.id}
        sections={course.sections.map((s) => ({
          name: s.name,
          items: s.items.map((u) => ({
            id: u.id,
            slug: u.slug,
            title: u.title,
            free: u.free,
          })),
        }))}
      />
      </CourseProgressProvider>
    </main>
  );
}
