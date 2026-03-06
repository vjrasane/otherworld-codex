import type { APIRoute } from "astro";
import { hashContent } from "../utils";
import type { DataEndpoint } from "../data/query-client";
import { routes } from "../routes";
import { type Campaign, campaigns } from "../data";

const hash = hashContent(campaigns);

export const endpoint: DataEndpoint<"campaigns", Campaign[]> = {
  key: "campaigns",
  options: {
    queryKey: ["campaigns", hash],
    route: routes.base + "/campaigns.json",
  },
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(campaigns), {
    headers: { "Content-Type": "application/json" },
  });
};
