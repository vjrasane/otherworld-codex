import type { APIRoute } from "astro";
import { getSearchIndex } from "../data";

const searchIndex = getSearchIndex();

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(searchIndex), {
    headers: { "Content-Type": "application/json" },
  });
};
