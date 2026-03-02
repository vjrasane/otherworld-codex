import type { APIRoute } from "astro";
import { hashContent } from "../utils";
import type { QueryOpts } from "../data/query-client";
import { routes } from "../routes";
import { parseCampaigns, type Campaign } from "../data/campaign";
import campaignsJson from "@/data/campaigns.json";
import { encounterCards } from "../data/card";

const campaigns = parseCampaigns(campaignsJson, encounterCards);

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
