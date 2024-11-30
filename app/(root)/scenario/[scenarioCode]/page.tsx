"use server";
import { appConfig } from "@/app.config";
import { getCardByCode, getScenarioByCode } from "@/db/db-client";
import { DecoderType, object, string } from "decoders";
import { entries, first, groupBy } from "lodash/fp";
import { Metadata } from "next";
import Head from "next/head";
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

  const encounterSets = scenario.encounterSetsToScenarios.map(
    ({ encounterSet }) => encounterSet
  );

  const imageUrl = encounterSets
    .flatMap((set) => set.cards)
    .find((card) => card.typeCode === "scenario")?.imageUrl;

  return (
    <div>
      <h1>{scenario.scenarioName}</h1>
      <div className="py-4">
        <img
          className="mx-auto"
          /* @ts-expect-error */
          src={imageUrl || null}
          alt={scenario.scenarioName}
        />
      </div>
      {encounterSets.map((encounterSet) => {
        return (
          <div key={encounterSet.encounterCode}>
            <h2>{encounterSet.encounterName}</h2>
          </div>
        );
      })}
    </div>
  );
};

export default ScenarioPage;
