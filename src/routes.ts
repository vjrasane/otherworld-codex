import type { Card } from "./data/card";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const routes = {
  campaign: (code: string) => `${base}/campaigns/${code}`,
  scenario: (code: string) => `${base}/scenarios/${code}`,
  encounter: (code: string) => `${base}/encounters/${code}`,
  card: (code: string) => `${base}/cards/${code}`,
  icon: (code: string) => `${base}/icons/${code}.svg`,
  index: `${base}/`,
  searchIndex: `${base}/search-index.json`,
} as const;

export const getCardRoute = (card: Card): string => {
  if (card.linkedToCard) return routes.card(card.linkedToCard.code);
  return routes.card(card.code);
};
