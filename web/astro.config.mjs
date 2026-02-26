import { defineConfig } from "astro/config";
import react from "@astrojs/react";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  site: isProd ? "https://vjrasane.github.io" : undefined,
  base: isProd ? "/otherworld-codex" : undefined,
  integrations: [react()],
});
