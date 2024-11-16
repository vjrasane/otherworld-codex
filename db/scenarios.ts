import { ScenarioInput } from "./schema";

type ScenarioData = ScenarioInput & {
    encounterCodes: string[]
}

export const scenarios: ScenarioData[] = [
    {
        scenarioCode: "the_gathering",
        name: "The Gathering",
        packCode: "core",
        encounterCodes: ["torch", "rats", "ghouls", "striking_fear", "ancient_evils", "chilling_cold"]
    }
]
