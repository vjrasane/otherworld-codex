import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { SITE_SLUG } from "./src/config";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  site: isProd ? "https://vjrasane.github.io" : undefined,
  base: isProd ? "/" + SITE_SLUG : undefined,
  integrations: [react()],
});
