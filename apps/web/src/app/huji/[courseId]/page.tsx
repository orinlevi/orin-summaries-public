import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById, getHujiCourses } from "@/lib/courses";
import { CourseProgressProvider, CourseProgressBar } from "@/components/CourseProgress";
import { CourseUnitFilter } from "@/components/CourseUnitFilter";

interface Props {
  params: Promise<{ courseId: string }>;
}

export async function generateStaticParams() {
  return getHujiCourses().map((course) => ({ courseId: course.id }));
}

export async function generateMetadata({ params }: Props) {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course) return {};
  return {
    title: `${course.title} | HUJI | Orin Summaries`,
    description: course.description,
  };
}

export default async function HujiCoursePage({ params }: Props) {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course || course.university !== "huji") notFound();

  const totalItems = course.units.length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/huji" className="hover:text-gray-700 dark:hover:text-gray-300">
          HUJI
        </Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-300">{course.title}</span>
      </nav>

      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{course.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{course.description}</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          {totalItems} פריטים
        </p>
      </header>

      <CourseProgressProvider courseId={course.id}>
        <CourseProgressBar totalUnits={totalItems} />

        {/* סיכומים ויחידות */}
        <CourseUnitFilter
          courseId={course.id}
          basePath="/huji"
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
