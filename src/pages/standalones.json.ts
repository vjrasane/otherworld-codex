import type { APIRoute } from "astro";
import { hashContent } from "../utils";
import type { QueryOpts } from "../data/query-client";
import { routes } from "../routes";
import { type Scenario, standalones } from "@/src/data";

const hash = hashContent(standalones);

export const options: QueryOpts<Scenario[]> = {
  queryKey: ["standalones", hash],
  route: routes.base + "/standalones.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(standalones), {
    headers: { "Content-Type": "application/json" },
  });
};
