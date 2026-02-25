"use server";
import { appConfig } from "@/app.config";
import { getCardByCode } from "@/db/db-client";
import { DecoderType, object, string } from "decoders";
import { entries, groupBy } from "lodash/fp";
import { Metadata } from "next";
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

  const scenariosByCampaign = groupBy(
    (s) => s.campaignName,
    card.scenarios
  );

  return (
    <div>
      <h1>{card.cardName}</h1>
      <p>{card.text}</p>
      <div className="py-4">
        <img
          className="mx-auto"
          /* @ts-expect-error */
          src={card.imageUrl || null}
          alt={card.cardName}
        />
      </div>
      <div>
        {card.traits.map((trait) => (
          <span key={trait} className="mr-2">
            {trait}
          </span>
        ))}
      </div>
      <div>{card.encounterName}</div>
      {entries(scenariosByCampaign).map(([campaign, scenarios]) => {
        return (
          <div key={campaign}>
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
