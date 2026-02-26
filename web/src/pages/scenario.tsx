import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { api } from "@/utils/api";
import { CardImage, CardPlaceholder } from "@/components/card-image";
import css from "./scenario.module.css";

export function ScenarioView() {
  const { code } = useParams<{ code: string }>();

  const { data: scenario, isLoading } = useQuery({
    queryKey: ["scenario", code],
    queryFn: () => api.scenario(code),
  });

  if (isLoading) return <p>Loading...</p>;
  if (!scenario) return <p>Scenario not found.</p>;

  return (
    <div className={css.page}>
      {scenario.scenarioPrefix && (
        <span className={css.prefix}>{scenario.scenarioPrefix}</span>
      )}
      <h1 className={css.title}>{scenario.scenarioName}</h1>

      {scenario.campaignCode && (
        <Link
          href={`/campaigns/${scenario.campaignCode}`}
          className={css.backLink}
        >
          Back to campaign
        </Link>
      )}

      <section className={css.section}>
        <h2 className={css.sectionTitle}>Encounter Sets</h2>
        <ul className={css.encounterSets}>
          {scenario.encounterSets.map((es) => (
            <li key={es.encounterCode} className={css.encounterSet}>
              {es.encounterName}
            </li>
          ))}
        </ul>
      </section>

      <section className={css.section}>
        <h2 className={css.sectionTitle}>
          Cards ({scenario.cards.length})
        </h2>
        <div className={css.cards}>
          {scenario.cards.map((c) => (
            <Link
              key={c.cardCode}
              href={`/cards/${c.cardCode}`}
              className={css.card}
            >
              {c.imageUrl ? (
                <CardImage
                  src={c.imageUrl}
                  alt={c.cardName}
                  typeCode={c.typeCode}
                />
              ) : (
                <CardPlaceholder
                  name={c.cardName}
                  typeCode={c.typeCode}
                />
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
