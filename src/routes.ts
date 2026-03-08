const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const routes = {
  base,
  cardImage: (id: string) => `${base}/images/cards/${id}`,
  icon: (code: string) => `${base}/icons/${code}.svg`,
  index: `${base}/`,
} as const;
