import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { SITE } from "./src/config";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  site: isProd ? SITE : undefined,
  base: isProd ? "/" : undefined,
  integrations: [react()],
});
