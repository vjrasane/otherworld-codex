import type { APIRoute } from "astro";
import { hashContent } from "@/src/utils";
import type { QueryOpts } from "@/src/data/query-client";
import { traits } from "@/src/data";
import { routes } from "@/src/routes";
import type { Trait } from "@/src/data/trait";

const hash = hashContent(traits);

export const options: QueryOpts<Trait[]> = {
  queryKey: ["traits", hash],
  route: routes.base + "/traits.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(traits), {
    headers: { "Content-Type": "application/json" },
  });
};
