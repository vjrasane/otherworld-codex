"use server";
import { appConfig } from "@/app.config";
import { getScenarioByCode } from "@/db/db-client";
import { DecoderType, object, string } from "decoders";
import { round } from "lodash";
import { entries, groupBy, orderBy, sumBy } from "lodash/fp";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { FunctionComponent } from "react";

const Params = object({
  scenarioCode: string,
});

type Params = DecoderType<typeof Params>;

export const generateMetadata = async (props: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { scenarioCode } = Params.verify(await props.params);
  const scenario = await getScenarioByCode(scenarioCode);
  if (!scenario)
    return {
      title: appConfig.appName,
    };
  return {
    title: appConfig.appName + ": " + scenario.scenarioName,
  };
};

const ScenarioPage: FunctionComponent<{
  params: Promise<Params>;
}> = async ({ params }) => {
  const { scenarioCode } = Params.verify(await params);
  const scenario = await getScenarioByCode(scenarioCode);
  if (!scenario) redirect("/");

  const cards = scenario.encounterSets.flatMap((set) => set.cards);
  type Card = (typeof cards)[number];

  const cardsByType = groupBy((card) => card.typeCode, cards);
  const encounterCards = [
    ...(cardsByType["enemy"] ?? []),
    ...(cardsByType["treacery"] ?? []),
  ];
  const encounterCardCount = sumBy(
    (card: Card) => card.quantity ?? 1,
    encounterCards
  );
  const cardsByTrait = encounterCards.reduce(
    (acc: Record<string, number>, card: Card): Record<string, number> => {
      card.traits.forEach((trait) => {
        if (!trait) return acc;
        if (!acc[trait]) {
          acc[trait] = 0;
        }
        acc[trait] += card.quantity ?? 1;
      });
      return acc;
    },
    {}
  );

  return (
    <div>
      <h1>{scenario.scenarioName}</h1>
      <div className="py-4">
        <img
          className="mx-auto"
          /* @ts-expect-error */
          src={scenario.imageUrl || null}
          alt={scenario.scenarioName}
        />
      </div>
      {encounterCardCount}
      {orderBy(
        ([, traitCards]) => traitCards,
        "desc",
        entries(cardsByTrait)
      ).map(([trait, traitCards]) => {
        return (
          <div>
            {trait} {traitCards}{" "}
            {round((traitCards / encounterCardCount) * 100, 1)}%
          </div>
        );
      })}
      {scenario.encounterSets.map((encounterSet) => {
        return (
          <div key={encounterSet.encounterCode}>
            <h2>{encounterSet.encounterName}</h2>
            {encounterSet.cards.map((card) => {
              return (
                <div key={card.cardCode}>
                  <div className="py-4">
                    <img
                      className="mx-auto"
                      /* @ts-expect-error */
                      src={card.imageUrl || null}
                      alt={card.cardName}
                    />
                    {card.typeCode}
                    <div>{card.traits.join(", ")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ScenarioPage;
