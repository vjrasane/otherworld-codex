import type { APIRoute } from "astro";
import { hashContent } from "@/src/utils";
import type { DataEndpoint } from "@/src/data/query-client";
import { encounterSets } from "@/src/data";
import { routes } from "@/src/routes";
import type { EncounterSet } from "../data/encounter-set";

const hash = hashContent(encounterSets);

export const endpoint: DataEndpoint<"encounterSets", EncounterSet[]> = {
  key: "encounterSets",
  options: {
    queryKey: ["encounterSets", hash],
    route: routes.base + "/encounter-sets.json",
  },
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(encounterSets), {
    headers: { "Content-Type": "application/json" },
  });
};
