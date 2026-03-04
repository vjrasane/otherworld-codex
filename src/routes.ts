const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const routes = {
  base,
  icon: (code: string) => `${base}/icons/${code}.svg`,
  index: `${base}/`,
  json: {
    searchIndex: `${base}/search-index.json`,
    encounterCards: `${base}/encounter-cards.json`,
    encounterCardsByCode: `${base}/encounter-cards-by-code.json`,
    cardMeta: `${base}/card-meta.json`,
  },
} as const;
