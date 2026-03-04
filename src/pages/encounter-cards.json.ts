import type { APIRoute } from "astro";
import { cards, type Card } from "../data";
import { hashContent } from "../utils";
import type { QueryOpts } from "../data/query-client";
import { routes } from "../routes";
import { sortBy } from "lodash/fp";

const encounterCards = sortBy(
  "code",
  cards.filter((c) => !!c.encounter_code),
);

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
