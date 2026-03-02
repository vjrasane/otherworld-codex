const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const routes = {
  base,
  campaign: (code: string) => `${base}/campaigns/${code}`,
  scenario: (code: string) => `${base}/scenarios/${code}`,
  encounter: (code: string) => `${base}/encounters/${code}`,
  card: (code: string) => `${base}/cards/${code}`,
  icon: (code: string) => `${base}/icons/${code}.svg`,
  index: `${base}/`,
  json: {
    searchIndex: `${base}/search-index.json`,
    encounterCards: `${base}/encounter-cards.json`,
    encounterCardsByCode: `${base}/encounter-cards-by-code.json`,
    cardMeta: `${base}/card-meta.json`,
  },
} as const;
