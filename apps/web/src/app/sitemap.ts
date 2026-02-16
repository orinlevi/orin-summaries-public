import { MetadataRoute } from "next";
import { getAllCourses } from "@/lib/courses";

const BASE_URL = "https://orin-summaries.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const courses = getAllCourses();

  const coursePages = courses.map((c) => ({
    url: `${BASE_URL}/course/${c.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const unitPages = courses.flatMap((c) =>
    c.units.map((u) => ({
      url: `${BASE_URL}/course/${c.id}/${u.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...coursePages,
    ...unitPages,
  ];
}
