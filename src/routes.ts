const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const routes = {
  base,
  card: (code: string) => `${base}/cards/${code}`,
  cardImage: (id: string) => `${base}/images/cards/${id}`,
  icon: (code: string) => `${base}/icons/${code}.svg`,
  index: `${base}/`,
} as const;
