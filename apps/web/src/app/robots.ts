import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/access"],
      },
    ],
    sitemap: "https://orin-summaries.vercel.app/sitemap.xml",
  };
}
