import type { APIRoute } from "astro";
import { hashContent } from "../utils";
import { type QueryOpts } from "../data/query-client";
import { routes } from "../routes";
import { filterOptions } from "../data/filter-options";

const hash = hashContent(filterOptions);

export const options: QueryOpts<typeof filterOptions> = {
  queryKey: ["filterOptions", hash],
  route: routes.base + "/filter-options.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(filterOptions), {
    headers: { "Content-Type": "application/json" },
  });
};
