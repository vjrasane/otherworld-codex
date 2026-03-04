import { campaigns, type Scenario } from ".";
import type { RawCampaign } from "./campaign";

export interface Meta {
  campaigns?: string[];
  scenarios?: string[];
  encounters?: string[];
  traits?: string[];
  types?: string[];
}

interface CardLike {
  code: string;
  type_code: string;
  traits?: string[];
}

// interface EnconterLike {
//   code: string;
//   cards: CardLike[];
// }

interface ScenarioLike {
  code: string;
  encounterCodes: string[];
  // encounterSets: EnconterLike[];
}

interface CampaignLike {
  code: string;
  scenarios: ScenarioLike[];
}

const getMeta = (item: CampaignLike | ScenarioLike, raws: RawCampaign[]) => {
  let campaigns: CampaignLike[] = [];
  let scenarios: ScenarioLike[] = [];
  if ("scenarios" in item) {
    scenarios = item.scenarios;
  } else if ("encounterCodes" in item) {
    campaigns = raws.filter((r) =>
      r.scenarios.some((s) => s.code === item.code),
    );
  }

  return {
    campaigns: campaigns.map((c) => c.code),
    scenarios: scenarios.map((s) => s.code),
  };
};
