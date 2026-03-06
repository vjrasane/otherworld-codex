import type { APIRoute } from "astro";
import { hashContent } from "@/src/utils";
import type { QueryOpts } from "@/src/data/query-client";
import { cardTypes } from "@/src/data";
import { routes } from "@/src/routes";
import type { CardType } from "@/src/data/card-type";

const hash = hashContent(cardTypes);

export const options: QueryOpts<CardType[]> = {
  queryKey: ["cardTypes", hash],
  route: routes.base + "/card-types.json",
};

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(cardTypes), {
    headers: { "Content-Type": "application/json" },
  });
};
