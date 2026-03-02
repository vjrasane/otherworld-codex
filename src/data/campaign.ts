import campaignsJson from "../../data/campaigns.json";
import { cardsByEncounter } from "./card";
import standalonesJson from "../../data/standalones.json";

export interface Standalone {
  code: string;
  name: string;
  order: number;
  encounterCodes: string[];
  imageUrl?: string;
}

export interface Scenario {
  code: string;
  name: string;
  header?: string;
  order: number;
  campaignCode: string;
  campaignName: string;
  encounterCodes: string[];
  imageUrl?: string;
}

export interface Campaign {
  code: string;
  name: string;
  order: number;
  scenarios: Scenario[];
  imageUrl?: string;
}

type RawCampaign = (typeof campaignsJson)[number];
type RawScenario = RawCampaign["scenarios"][number];

export const campaigns: Campaign[] = campaignsJson.map((raw: RawCampaign) => {
  const scenarios: Scenario[] = raw.scenarios.map((s: RawScenario) => {
    const encounterCards = s.encounterCodes.flatMap(
      (ec: string) => cardsByEncounter.get(ec) ?? [],
    );
    const imageCard = encounterCards.find((c) => c.imageUrl);
    return {
      code: s.scenarioCode,
      name: s.scenarioName,
      header: s.scenarioHeader || undefined,
      order: s.scenarioOrder,
      campaignCode: raw.campaignCode,
      campaignName: raw.campaignName,
      encounterCodes: s.encounterCodes,
      imageUrl: imageCard?.imageUrl,
    };
  });
  scenarios.sort((a, b) => a.order - b.order);
  const imageUrl = scenarios[0]?.imageUrl;
  return {
    code: raw.campaignCode,
    name: raw.campaignName,
    order: raw.campaignOrder,
    scenarios,
    imageUrl,
  };
});
campaigns.sort((a, b) => a.order - b.order);

export const campaignsByCode = new Map<string, Campaign>();
for (const c of campaigns) {
  campaignsByCode.set(c.code, c);
}

export const scenariosByCode = new Map<string, Scenario>();
for (const c of campaigns) {
  for (const s of c.scenarios) {
    scenariosByCode.set(s.code, s);
  }
}

export const standalones: Standalone[] = standalonesJson.map((raw) => {
  const encounterCards = raw.encounterCodes.flatMap(
    (ec: string) => cardsByEncounter.get(ec) ?? [],
  );
  const imageCard = encounterCards.find((c) => c.imageUrl);
  return {
    code: raw.scenarioCode,
    name: raw.scenarioName,
    order: raw.scenarioOrder,
    encounterCodes: raw.encounterCodes,
    imageUrl: imageCard?.imageUrl,
  };
});
standalones.sort((a, b) => a.order - b.order);

export const standalonesByCode = new Map<string, Standalone>();
for (const s of standalones) {
  standalonesByCode.set(s.code, s);
}
