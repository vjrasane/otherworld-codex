import { dunwichLegacy } from "./campaigns/dunwich-legacy";
import { nightOfTheZealot } from "./campaigns/night-of-the-zealot";
import { CampaignInput, ScenarioInput } from "./schema";

type ScenarioData = ScenarioInput & {
    encounterCodes: string[]
}

type CampaignData = CampaignInput & {
    scenarios: Omit<ScenarioData, "packCode" | "campaignCode" | "scenarioPosition">[]
}

export const campaigns: CampaignData[] = [
    nightOfTheZealot,
    dunwichLegacy
]

export const standalones: ScenarioData[] = []
