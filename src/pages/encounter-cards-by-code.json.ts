import type { APIRoute } from "astro";
import { encounterCardsByCode, type Card } from "../data/card";
import { hashContent } from "../utils";
import { type QueryOpts } from "../data/query-client";
import { routes } from "../routes";

const data = Object.fromEntries(encounterCardsByCode);

const hash = hashContent(data);

export const options: QueryOpts<Record<string, Card>> = {
  queryKey: ["encounterCardsByCode", hash],
  route: routes.json.encounterCardsByCode,
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};
