import dotenv from "dotenv";
import { trimCharsEnd } from "lodash/fp";
import { campaigns } from "../db/data";
import { Card as ArkhamDBCard, getCards } from "../db/get-card-data";
import { getClient } from "../db/client";
import { upsertCard } from "../db/generated/cards_sql";
import {
    upsertCampaign,
    upsertScenario,
    upsertEncounterSetScenario,
} from "../db/generated/campaigns_sql";

dotenv.config({ path: ".env" });

const parseTraits = (traitsStr: string | undefined): string[] => {
    if (!traitsStr) return [];
    return traitsStr
        .split(".")
        .map((v) => v.trim())
        .filter((v) => v.length)
        .map((v) => trimCharsEnd(".", v));
};

const insertCards = async (cards: ArkhamDBCard[]) => {
    const client = getClient();
    for (const c of cards) {
        if (!c.pack_code) continue;
        await upsertCard(client, {
            cardCode: c.code,
            cardName: c.name,
            realName: c.real_name ?? null,
            typeCode: c.type_code,
            typeName: c.type_name,
            factionCode: c.faction_code,
            factionName: c.faction_name,
            encounterCode: c.encounter_code ?? null,
            encounterName: c.encounter_name ?? null,
            encounterPosition: c.encounter_position ?? null,
            position: c.position ?? null,
            text: c.text ?? null,
            backText: c.back_text ?? null,
            flavor: c.flavor ?? null,
            traits: parseTraits(c.traits),
            url: c.url,
            imagesrc: c.imagesrc ?? null,
            backimagesrc: c.backimagesrc ?? null,
            backFlavor: c.back_flavor ?? null,
            rawData: JSON.stringify(c),
            packCode: c.pack_code,
            packName: c.pack_name ?? c.pack_code,
            quantity: c.quantity ?? null,
        });
    }
};

const insertCampaigns = async () => {
    const client = getClient();
    for (const campaign of campaigns) {
        await upsertCampaign(client, {
            campaignCode: campaign.campaignCode,
            campaignName: campaign.campaignName,
        });

        for (const [index, scenario] of campaign.scenarios.entries()) {
            await upsertScenario(client, {
                scenarioCode: scenario.scenarioCode,
                scenarioName: scenario.scenarioName,
                scenarioPrefix: scenario.scenarioPrefix ?? null,
                packCode: campaign.packCode,
                campaignCode: campaign.campaignCode,
                position: index + 1,
            });

            for (const [esIndex, encounterCode] of scenario.encounterCodes.entries()) {
                await upsertEncounterSetScenario(client, {
                    encounterCode,
                    scenarioCode: scenario.scenarioCode,
                    position: esIndex + 1,
                });
            }
        }
    }
};

const main = async () => {
    const cards = await getCards();
    await insertCards(cards);
    await insertCampaigns();
    console.log("Done");
};

main();
