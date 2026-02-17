import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById, getUnitBySlug, getAdjacentUnits, getHujiCourses } from "@/lib/courses";
import { getUnitContent } from "@/lib/content";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { ContentErrorBoundary } from "@/components/content/ContentErrorBoundary";
import { TableOfContents } from "@/components/content/TableOfContents";
import { ProtectedContent } from "@/components/ProtectedContent";
import { BackToTop } from "@/components/ui/BackToTop";
import { UnitProgress } from "@/components/UnitProgress";
import { CopyCodeButton } from "@/components/content/CopyCodeButton";

interface Props {
  params: Promise<{ courseId: string; unitSlug: string }>;
}

export async function generateStaticParams() {
  const courses = getHujiCourses();
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
    title: `${unit.title} | ${course.title} | HUJI`,
    description: `${unit.title} - ${course.title}`,
  };
}

export default async function HujiUnitPage({ params }: Props) {
  const { courseId, unitSlug } = await params;
  const course = getCourseById(courseId);
  if (!course || course.university !== "huji") notFound();

  const unit = getUnitBySlug(course, unitSlug);
  if (!unit) notFound();

  const { prev, next } = getAdjacentUnits(course, unitSlug);

  let content: string;
  try {
    content = getUnitContent(course, unit);
  } catch {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "HUJI", item: "https://orin-summaries.vercel.app/huji" },
      { "@type": "ListItem", position: 2, name: course.title, item: `https://orin-summaries.vercel.app/huji/${course.id}` },
      { "@type": "ListItem", position: 3, name: unit.title },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex gap-8">
        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/huji" className="hover:text-gray-700 dark:hover:text-gray-300">
              HUJI
            </Link>
            <span>/</span>
            <Link href={`/huji/${course.id}`} className="hover:text-gray-700 dark:hover:text-gray-300">
              {course.title}
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">{unit.title}</span>
          </nav>

          <ProtectedContent isFree={unit.free} courseName={course.title}>
            <ContentErrorBoundary>
              <MarkdownRenderer content={content} courseId={course.id} currentFile={unit.file} />
            </ContentErrorBoundary>
            <CopyCodeButton />

            <nav className="flex justify-between mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
              {prev ? (
                <Link
                  href={`/huji/${course.id}/${prev.slug}`}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  &rarr; {prev.title}
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/huji/${course.id}/${next.slug}`}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {next.title} &larr;
                </Link>
              ) : (
                <div />
              )}
            </nav>

            <UnitProgress
              courseId={course.id}
              unitId={unit.id}
              unitIndex={course.units.findIndex((u) => u.slug === unitSlug)}
              totalUnits={course.units.length}
            />
          </ProtectedContent>
        </main>

        {/* Table of Contents sidebar */}
        <aside className="hidden xl:block w-56 flex-shrink-0">
          <TableOfContents markdown={content} />
        </aside>
      </div>
      <BackToTop />
    </div>
  );
}
