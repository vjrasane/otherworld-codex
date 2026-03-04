import type { APIRoute } from "astro";
import { hashContent } from "../utils";
import type { QueryOpts } from "../data/query-client";
import { routes } from "../routes";
import { type Campaign, campaigns } from "../data";

const hash = hashContent(campaigns);

export const options: QueryOpts<Campaign[]> = {
  queryKey: ["campaigns", hash],
  route: routes.base + "/campaigns.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(campaigns), {
    headers: { "Content-Type": "application/json" },
  });
};
