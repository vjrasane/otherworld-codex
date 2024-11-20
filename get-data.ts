import { getScenarioEncounterCards, search } from "./db/db-client"

const [, , ...args] = process.argv

const main = async () => {
    // const cards = await getScenarioEncounterCards("the_gathering")
    const results = await search(args.join(" "))
    console.log(results)
    // console.log(cards.map(c => ({

    //     name: c.name,
    //     rank: c.rank
    // })))
}

main()