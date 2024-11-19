import { nightOfTheZealot } from "./campaigns/night-of-the-zealot";
import { CampaignInput, ScenarioInput } from "./schema";

type ScenarioData = ScenarioInput & {
    encounterCodes: string[]
}

type CampaignData = CampaignInput & {
    scenarios: Omit<ScenarioData, "packCode" | "campaignCode">[]
}

export const campaigns: CampaignData[] = [
    nightOfTheZealot
]

export const standalones: ScenarioData[] = []
