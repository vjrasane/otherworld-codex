import type { APIRoute } from "astro";
import { hashContent } from "../utils";
import type { QueryOpts } from "../data/query-client";
import { routes } from "../routes";
import { type Scenario, scenarios } from "@/src/data";

const hash = hashContent(scenarios);

export const options: QueryOpts<Scenario[]> = {
  queryKey: ["scenarios", hash],
  route: routes.base + "/scenarios.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(scenarios), {
    headers: { "Content-Type": "application/json" },
  });
};
