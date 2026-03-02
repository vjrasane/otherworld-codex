import type { APIRoute } from "astro";
import { getSearchIndex } from "../data";
import { hashContent } from "../utils";
import { type QueryOpts } from "../data/query-client";
import { routes } from "../routes";
import type { SearchEntry } from "../data/search-index";
const searchIndex = getSearchIndex();

const hash = hashContent(searchIndex);

export const options: QueryOpts<SearchEntry[]> = {
  queryKey: ["searchIndex", hash],
  route: routes.json.searchIndex,
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(searchIndex), {
    headers: { "Content-Type": "application/json" },
  });
};
