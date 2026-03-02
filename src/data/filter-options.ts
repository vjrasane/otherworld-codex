import type { Campaign, Standalone } from "./campaign";
import type { Card } from "./card";

export const buildFilterOptions = (
  cards: Card[],
  campaigns: Campaign[],
  standalones: Standalone[],
) => {
  const campaignOptions = campaigns.map((c) => ({
    label: c.name,
    value: c.code,
  }));

  const scenarioOptions = [
    ...campaigns.flatMap((c) =>
      c.scenarios.map((s) => ({
        label: s.name,
        value: s.code,
        campaignCode: c.code,
        encounterCodes: s.encounterCodes,
      })),
    ),
    ...standalones.map((s) => ({
      label: s.name,
      value: s.code,
      campaignCode: "",
      encounterCodes: s.encounterCodes,
    })),
  ];

  const encounterMap = new Map<string, string>();
  for (const card of cards) {
    if (
      card.encounterCode &&
      card.encounterName &&
      !encounterMap.has(card.encounterCode)
    ) {
      encounterMap.set(card.encounterCode, card.encounterName);
    }
  }
  const encounterOptions = [...encounterMap.entries()]
    .map(([code, name]) => ({ label: name, value: code }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const traitSet = new Set<string>();
  for (const card of cards) {
    if (card.traits) {
      card.traits
        .split(".")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => traitSet.add(t));
    }
  }
  const traitOptions = [...traitSet]
    .sort()
    .map((t) => ({ label: t, value: t }));

  const typeMap = new Map<string, string>();
  for (const card of cards) {
    if (!typeMap.has(card.typeCode)) {
      typeMap.set(card.typeCode, card.typeName);
    }
  }
  const typeOptions = [...typeMap.entries()]
    .map(([code, name]) => ({ label: name, value: code }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const filterOptions = {
    campaigns: campaignOptions,
    scenarios: scenarioOptions,
    encounters: encounterOptions,
    traits: traitOptions,
    types: typeOptions,
  };
  return filterOptions;
};
