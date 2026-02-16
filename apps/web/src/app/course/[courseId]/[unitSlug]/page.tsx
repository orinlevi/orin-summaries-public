import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById, getUnitBySlug, getAdjacentUnits, getAllCourses } from "@/lib/courses";
import { getUnitContent } from "@/lib/content";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { TableOfContents } from "@/components/content/TableOfContents";
import { ProtectedContent } from "@/components/ProtectedContent";

interface Props {
  params: Promise<{ courseId: string; unitSlug: string }>;
}

export async function generateStaticParams() {
  const courses = getAllCourses();
  const params: { courseId: string; unitSlug: string }[] = [];
  for (const course of courses) {
    for (const unit of course.units) {
      params.push({ courseId: course.id, unitSlug: unit.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const { courseId, unitSlug } = await params;
  const course = getCourseById(courseId);
  if (!course) return {};
  const unit = getUnitBySlug(course, unitSlug);
  if (!unit) return {};
  return {
    title: `${unit.title} | ${course.title}`,
    description: `${unit.title} - ${course.title}`,
  };
}

export default async function UnitPage({ params }: Props) {
  const { courseId, unitSlug } = await params;
  const course = getCourseById(courseId);
  if (!course) notFound();

  const unit = getUnitBySlug(course, unitSlug);
  if (!unit) notFound();

  const { prev, next } = getAdjacentUnits(course, unitSlug);

  let content: string;
  try {
    content = getUnitContent(course, unit);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-300">
              קורסים
            </Link>
            <span>/</span>
            <Link href={`/course/${course.id}`} className="hover:text-gray-300">
              {course.title}
            </Link>
            <span>/</span>
            <span className="text-gray-300">{unit.title}</span>
          </nav>

          <ProtectedContent isFree={unit.free} courseName={course.title}>
            <MarkdownRenderer content={content} courseId={course.id} currentFile={unit.file} />

            <nav className="flex justify-between mt-16 pt-8 border-t border-gray-800">
              {prev ? (
                <Link
                  href={`/course/${course.id}/${prev.slug}`}
                  className="text-gray-400 hover:text-gray-200"
                >
                  &rarr; {prev.title}
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/course/${course.id}/${next.slug}`}
                  className="text-gray-400 hover:text-gray-200"
                >
                  {next.title} &larr;
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </ProtectedContent>
        </main>

        {/* Table of Contents sidebar */}
        <aside className="hidden xl:block w-56 flex-shrink-0">
          <TableOfContents markdown={content} />
        </aside>
      </div>
    </div>
  );
}
