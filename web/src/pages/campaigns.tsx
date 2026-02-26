import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { api } from "@/utils/api";
import css from "./campaigns.module.css";

export function CampaignList() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api.campaigns(),
  });

  if (isLoading) return <p>Loading...</p>;
  if (!campaigns) return <p>No campaigns found.</p>;

  return (
    <div className={css.page}>
      <h1 className={css.title}>Campaigns</h1>
      <ul className={css.list}>
        {campaigns.map((c) => (
          <li key={c.campaignCode}>
            <Link href={`/campaigns/${c.campaignCode}`} className={css.campaign}>
              {c.imageUrl && (
                <img
                  className={css.thumb}
                  src={c.imageUrl}
                  alt=""
                  loading="lazy"
                />
              )}
              <span className={css.name}>{c.campaignName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
