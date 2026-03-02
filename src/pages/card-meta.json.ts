import type { APIRoute } from "astro";
import { hashContent } from "../utils";
import { type QueryOpts } from "../data/query-client";
import { routes } from "../routes";
import { cardMeta } from "../data/card-meta";

const hash = hashContent(cardMeta);

export const options: QueryOpts<typeof cardMeta> = {
  queryKey: ["cardMeta", hash],
  route: routes.json.cardMeta,
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(cardMeta), {
    headers: { "Content-Type": "application/json" },
  });
};
