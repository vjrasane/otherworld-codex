import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { api } from "@/utils/api";
import css from "./campaign.module.css";

export function CampaignView() {
  const { code } = useParams<{ code: string }>();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", code],
    queryFn: () => api.campaign(code),
  });

  if (isLoading) return <p>Loading...</p>;
  if (!campaign) return <p>Campaign not found.</p>;

  return (
    <div className={css.page}>
      <h1 className={css.title}>{campaign.campaignName}</h1>

      <ol className={css.scenarios}>
        {campaign.scenarios.map((s) => (
          <li key={s.scenarioCode}>
            <Link
              href={`/scenarios/${s.scenarioCode}`}
              className={css.scenario}
            >
              {s.imageUrl && (
                <img
                  className={css.thumb}
                  src={s.imageUrl}
                  alt=""
                  loading="lazy"
                />
              )}
              <div className={css.scenarioInfo}>
                {s.scenarioPrefix && (
                  <span className={css.prefix}>{s.scenarioPrefix}</span>
                )}
                <span className={css.scenarioName}>{s.scenarioName}</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
