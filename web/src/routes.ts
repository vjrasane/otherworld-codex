const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const routes = {
  campaign: (code: string) => `${base}/campaigns/${code}`,
  scenario: (code: string) => `${base}/scenarios/${code}`,
  encounter: (code: string) => `${base}/encounters/${code}`,
  card: (code: string) => `${base}/cards/${code}`,
  icon: (code: string) => `${base}/icons/${code}.svg`,
} as const;
