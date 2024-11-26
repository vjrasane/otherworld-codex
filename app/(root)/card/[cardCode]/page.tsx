"use server";
import { appConfig } from "@/app.config";
import { getCardByCode } from "@/db/db-client";
import { DecoderType, object, string } from "decoders";
import { entries, groupBy } from "lodash/fp";
import { Metadata } from "next";
import Head from "next/head";
import { redirect } from "next/navigation";
import { FunctionComponent } from "react";

const Params = object({
  cardCode: string,
});

type Params = DecoderType<typeof Params>;

export const generateMetadata = async (props: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { cardCode } = Params.verify(await props.params);
  const card = await getCardByCode(cardCode);
  if (!card)
    return {
      title: appConfig.appName,
    };
  return {
    title: appConfig.appName + ": " + card.cardName,
  };
};

const CardPage: FunctionComponent<{
  params: Promise<Params>;
}> = async ({ params }) => {
  const { cardCode } = Params.verify(await params);
  const card = await getCardByCode(cardCode);
  if (!card) redirect("/");

  const scenarios = card.encounterSet?.encounterSetsToScenarios.map(
    ({ scenario }) => scenario
  );
  const scenariosByCampaign = groupBy(
    ({ campaign }) => campaign?.campaignName,
    scenarios
  );

  return (
    <div>
      <Head>
        <title>{card.cardName}</title>
        <meta property="og:title" content={card.cardName} key="title" />
      </Head>
      <h1>{card.cardName}</h1>
      <p>{card.text}</p>
      <div className="py-4">
        <img
          className="mx-auto"
          src={card.imageUrl ?? ""}
          alt={card.cardName}
        />
      </div>
      <div>{card.encounterSet?.encounterName}</div>
      {entries(scenariosByCampaign).map(([campaign, scenarios]) => {
        return (
          <div>
            <div>{campaign}</div>
            {scenarios.map(({ scenarioName }) => {
              return <div key={scenarioName}>{scenarioName}</div>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export default CardPage;
