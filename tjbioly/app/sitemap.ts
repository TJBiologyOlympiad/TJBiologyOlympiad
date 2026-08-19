import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const BASE_URL = "https://tjbo.org";

const PRIVATE_ROUTES = ["/admin", "/dashboard", "/profile", "/potw", "/resources", "/schedule"];

const SKIP_DIRS = new Set(["api", "components"]);

function getPageRoutes(dir: string, baseDir: string): string[] {
  const routes: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith("[") || entry.name.startsWith(".")) continue;
      routes.push(...getPageRoutes(path.join(dir, entry.name), baseDir));
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      const relDir = path.relative(baseDir, dir).split(path.sep).filter(Boolean).join("/");
      routes.push(relDir ? `/${relDir}` : "/");
    }
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const appDir = path.join(process.cwd(), "app");
  const routes = getPageRoutes(appDir, appDir).filter(
    (route) => !PRIVATE_ROUTES.some((p) => route === p || route.startsWith(`${p}/`))
  );

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
