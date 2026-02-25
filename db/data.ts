import { dunwichLegacy } from "./campaigns/dunwich-legacy";
import { nightOfTheZealot } from "./campaigns/night-of-the-zealot";

interface ScenarioData {
    scenarioCode: string;
    scenarioName: string;
    scenarioPrefix?: string;
    encounterCodes: string[];
}

interface CampaignData {
    campaignCode: string;
    campaignName: string;
    packCode: string;
    scenarios: ScenarioData[];
}

export const campaigns: CampaignData[] = [
    nightOfTheZealot,
    dunwichLegacy,
];
