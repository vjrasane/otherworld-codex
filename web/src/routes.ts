export const routes = {
  campaign: (code: string) => `/campaigns/${code}`,
  scenario: (code: string) => `/scenarios/${code}`,
  encounter: (code: string) => `/encounters/${code}`,
  card: (code: string) => `/cards/${code}`,
} as const;
