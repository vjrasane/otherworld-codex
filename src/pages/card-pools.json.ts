import type { APIRoute } from "astro";
import { hashContent } from "@/src/utils";
import type { QueryOpts } from "@/src/data/query-client";
import { cardPools } from "@/src/data";
import { routes } from "@/src/routes";
import type { CardPool } from "@/src/data/card-pool";

const hash = hashContent(cardPools);

export const options: QueryOpts<CardPool[]> = {
  queryKey: ["cardPools", hash],
  route: routes.base + "/card-pools.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(cardPools), {
    headers: { "Content-Type": "application/json" },
  });
};
