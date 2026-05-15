import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById, getUnitBySlug, getAdjacentUnits } from "@/lib/courses";
import { getUnitContent } from "@/lib/content";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { ContentErrorBoundary } from "@/components/content/ContentErrorBoundary";
import { TableOfContents } from "@/components/content/TableOfContents";
import { BackToTop } from "@/components/ui/BackToTop";
import { CopyCodeButton } from "@/components/content/CopyCodeButton";
import { ProtectedContent } from "@/components/ProtectedContent";

interface Props {
  params: Promise<{ unitSlug: string }>;
}

function getCourse() {
  return getCourseById("hi-tech-map");
}

export async function generateStaticParams() {
  const course = getCourse();
  if (!course) return [];
  return course.units.map((unit) => ({ unitSlug: unit.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { unitSlug } = await params;
  const course = getCourse();
  if (!course) return {};
  const unit = getUnitBySlug(course, unitSlug);
  if (!unit) return {};

  // Find which section this unit belongs to
  const section = course.sections.find((s) => s.items.some((i) => i.slug === unitSlug));
  const sectionTitle = section?.name || "";

  return {
    title: `${unit.title} | ${sectionTitle} | מפת הייטק`,
    description: `${unit.title} — ${sectionTitle} | מפת הייטק`,
  };
}

export default async function HiTechMapUnitPage({ params }: Props) {
  const { unitSlug } = await params;
  const course = getCourse();
  if (!course) notFound();

  const unit = getUnitBySlug(course, unitSlug);
  if (!unit) notFound();

  const { prev, next } = getAdjacentUnits(course, unitSlug);

  // Find which section this unit belongs to
  const section = course.sections.find((s) => s.items.some((i) => i.slug === unitSlug));

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
      { "@type": "ListItem", position: 1, name: "מפת הייטק", item: "https://orin-summaries.vercel.app/hi-tech-map" },
      { "@type": "ListItem", position: 2, name: section?.name || "מדור", item: "https://orin-summaries.vercel.app/hi-tech-map" },
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
            <Link href="/hi-tech-map" className="hover:text-gray-700 dark:hover:text-gray-300">
              מפת הייטק
            </Link>
            <span>/</span>
            <span className="text-gray-400 dark:text-gray-500">{section?.name}</span>
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
                  href={`/hi-tech-map/${prev.slug}`}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  &rarr; {prev.title}
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/hi-tech-map/${next.slug}`}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
      <BackToTop />
    </div>
  );
}
