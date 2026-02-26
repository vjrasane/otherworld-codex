const BASE_URL = "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new ApiError(res.statusText, res.status);
  }
  return res.json();
}

export interface SearchResult {
  type: string;
  code: string;
  name: string;
  imageUrl: string | null;
  cardTypeCode: string | null;
  packName: string | null;
}

export interface Campaign {
  campaignCode: string;
  campaignName: string;
  imageUrl: string | null;
  scenarios: CampaignScenario[];
}

export interface CampaignScenario {
  scenarioCode: string;
  scenarioName: string;
  scenarioPrefix: string | null;
  position: number;
  imageUrl: string | null;
}

export interface Scenario {
  scenarioCode: string;
  scenarioName: string;
  scenarioPrefix: string | null;
  campaignCode: string | null;
  position: number;
  imageUrl: string | null;
  encounterSets: EncounterSet[];
  cards: ScenarioCard[];
}

export interface EncounterSet {
  encounterCode: string | null;
  encounterName: string | null;
  position: number;
}

export interface ScenarioCard {
  cardCode: string;
  cardName: string;
  typeCode: string;
  typeName: string;
  encounterCode: string | null;
  traits: string[];
  quantity: number | null;
  imageUrl: string | null;
}

export interface Card {
  cardCode: string;
  cardName: string;
  realName: string | null;
  typeCode: string;
  typeName: string;
  factionCode: string;
  factionName: string;
  encounterCode: string | null;
  encounterName: string | null;
  encounterPosition: number | null;
  position: number | null;
  text: string | null;
  backText: string | null;
  flavor: string | null;
  traits: string[];
  url: string;
  imageSrc: string | null;
  backImageSrc: string | null;
  backFlavor: string | null;
  packCode: string;
  packName: string;
  quantity: number | null;
  imageUrl: string | null;
  scenarios: CardScenario[];
}

export interface CardScenario {
  scenarioCode: string;
  scenarioName: string;
  campaignCode: string | null;
  campaignName: string;
}

export interface CampaignListItem {
  campaignCode: string;
  campaignName: string;
  imageUrl: string | null;
}

export interface EncounterSetDetail {
  encounterCode: string;
  encounterName: string;
  imageUrl: string | null;
  scenarios: EncounterSetScenario[];
  cards: ScenarioCard[];
}

export interface EncounterSetScenario {
  scenarioCode: string;
  scenarioName: string;
  campaignCode: string | null;
  campaignName: string;
}

export const api = {
  search: (q: string, limit = 20) =>
    request<SearchResult[]>(`/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  campaigns: () => request<CampaignListItem[]>("/campaigns"),
  campaign: (code: string) => request<Campaign>(`/campaigns/${code}`),
  encounterSet: (code: string) => request<EncounterSetDetail>(`/encounters/${code}`),
  scenario: (code: string) => request<Scenario>(`/scenarios/${code}`),
  card: (code: string) => request<Card>(`/cards/${code}`),
};
