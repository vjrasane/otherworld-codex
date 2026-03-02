import type { APIRoute } from "astro";
import { encounterCardsByCode } from "../data/card";
import { hashContent } from "../utils";

const data = Object.fromEntries(encounterCardsByCode);

export const HASH = hashContent(data);

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};
