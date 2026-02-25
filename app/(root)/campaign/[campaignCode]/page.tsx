import { appConfig } from "@/app.config";
import { getCampaignByCode } from "@/db/db-client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { FunctionComponent } from "react";
import { z } from "zod";

const Params = z.object({
  campaignCode: z.string(),
});

type Params = z.infer<typeof Params>;

export const generateMetadata = async (props: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { campaignCode } = Params.parse(await props.params);
  const campaign = await getCampaignByCode(campaignCode);
  if (!campaign)
    return {
      title: appConfig.appName,
    };
  return {
    title: appConfig.appName + ": " + campaign.campaignName,
  };
};

const CampaignPage: FunctionComponent<{
  params: Promise<Params>;
}> = async (props) => {
  const { campaignCode } = Params.parse(await props.params);
  const campaign = await getCampaignByCode(campaignCode);
  if (!campaign) return redirect("/");

  return (
    <div>
      {campaign?.campaignName}
      <div>
        {campaign.scenarios.map((s) => (
          <div>
            {s.scenarioName} {s.position}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignPage;
