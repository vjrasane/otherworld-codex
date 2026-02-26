import type { APIRoute } from "astro";
import { getSearchIndex } from "../data";

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(getSearchIndex()), {
    headers: { "Content-Type": "application/json" },
  });
};
