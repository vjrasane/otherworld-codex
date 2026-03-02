import type { APIRoute } from "astro";
import { encounterCards, type Card } from "../data/card";
import { hashContent } from "../utils";
import type { QueryOpts } from "../data/query-client";
import { routes } from "../routes";

const hash = hashContent(encounterCards);

export const options: QueryOpts<Card[]> = {
  queryKey: ["encounterCards", hash],
  route: routes.json.encounterCards,
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(encounterCards), {
    headers: { "Content-Type": "application/json" },
  });
};
