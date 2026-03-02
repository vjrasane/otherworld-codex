import type { APIRoute } from "astro";
import { encounterCards } from "../data/card";
import { hashContent } from "../utils";

export const HASH = hashContent(encounterCards);

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(encounterCards), {
    headers: { "Content-Type": "application/json" },
  });
};
