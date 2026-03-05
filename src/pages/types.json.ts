import type { APIRoute } from "astro";
import { hashContent } from "@/src/utils";
import type { QueryOpts } from "@/src/data/query-client";
import { types } from "@/src/data";
import { routes } from "@/src/routes";
import type { Type } from "@/src/data/type";

const hash = hashContent(types);

export const options: QueryOpts<Type[]> = {
  queryKey: ["types", hash],
  route: routes.base + "/types.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(types), {
    headers: { "Content-Type": "application/json" },
  });
};
