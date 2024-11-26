const scenarios = [
    {
        scenarioCode: "the_gathering",
        scenarioPrefix: "Part I",
        scenarioName: "The Gathering",
        encounterCodes: ["torch", "rats", "ghouls", "striking_fear", "ancient_evils", "chilling_cold"]
    },
    {
        scenarioCode: "the_midnight_masks",
        scenarioPrefix: "Part II",
        scenarioName: "The Midnight Masks",
        encounterCodes: ["arkham", "chilling_cold", "nightgaunts", "pentagram", "locked_doors", "cultists"]
    },
    {
        scenarioCode: "the_devourer_below",
        scenarioPrefix: "Part III",
        scenarioName: "The Devourer Below",
        encounterCodes: ["tentacles", "ancient_evils", "striking_fear", "ghouls", "pentagram",
            "agents_of_yog", "agents_of_shub", "agents_of_cthulhu", "agents_of_hastur"
        ]
    }
]

export const nightOfTheZealot = {
    campaignCode: "night_of_the_zealot",
    campaignName: "Night of the Zealot",
    packCode: "core",
    scenarios
}