import { getScenarioEncounterCards, search } from "./db/db-client"

const main = async () => {
    // const cards = await getScenarioEncounterCards("the_gathering")
    const cards = await search("ancient evils")
    console.log(cards.map(c => ({
        name: c.name,
        text: c.text,
        rank: c.rank
    })))
}

main()