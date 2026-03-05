import type { APIRoute } from "astro";
import { cards, type Card } from "../data";
import { hashContent } from "../utils";
import type { QueryOpts } from "../data/query-client";
import { routes } from "../routes";
import { sortBy } from "lodash-es";

const data = sortBy(cards, "code");

const hash = hashContent(data);

export const options: QueryOpts<Card[]> = {
  queryKey: ["cards", hash],
  route: routes.base + "/cards.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};
