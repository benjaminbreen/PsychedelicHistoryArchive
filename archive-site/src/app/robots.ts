import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/admin/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow
      },
      {
        userAgent: ["OAI-SearchBot", "ChatGPT-User", "GPTBot"],
        allow: "/",
        disallow
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
