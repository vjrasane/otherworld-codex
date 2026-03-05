import type { APIRoute } from "astro";
import { hashContent } from "@/src/utils";
import type { QueryOpts } from "@/src/data/query-client";
import { encounterSets } from "@/src/data";
import { routes } from "@/src/routes";
import type { EncounterSet } from "../data/encounter-set";

const hash = hashContent(encounterSets);

export const options: QueryOpts<EncounterSet[]> = {
  queryKey: ["encounterSets", hash],
  route: routes.base + "/encounter-sets.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(encounterSets), {
    headers: { "Content-Type": "application/json" },
  });
};
