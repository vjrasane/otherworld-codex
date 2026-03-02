import type { APIRoute } from "astro";
import { hashContent } from "../utils";
import type { QueryOpts } from "../data/query-client";
import { routes } from "../routes";
import { parseStandalones, type Standalone } from "../data/campaign";
import standalonesJson from "@/data/standalones.json";
import { encounterCards } from "../data/card";

const standalones = parseStandalones(standalonesJson, encounterCards);

const hash = hashContent(standalones);

export const options: QueryOpts<Standalone[]> = {
  queryKey: ["standalones", hash],
  route: routes.base + "/standalones.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(standalones), {
    headers: { "Content-Type": "application/json" },
  });
};
