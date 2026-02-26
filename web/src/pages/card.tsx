import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { api } from "@/utils/api";
import { CardImage } from "@/components/card-image";
import css from "./card.module.css";

export function CardView() {
  const { code } = useParams<{ code: string }>();

  const { data: card, isLoading } = useQuery({
    queryKey: ["card", code],
    queryFn: () => api.card(code),
  });

  if (isLoading) return <p>Loading...</p>;
  if (!card) return <p>Card not found.</p>;

  return (
    <div className={css.page}>
      <div className={css.layout}>
        {card.imageUrl && (
          <div className={css.imageColumn}>
            <CardImage
              src={card.imageUrl}
              alt={card.cardName}
              typeCode={card.typeCode}
              className={css.image}
            />
          </div>
        )}

        <div className={css.details}>
          <h1 className={css.title}>{card.cardName}</h1>

          <dl className={css.meta}>
            <dt>Type</dt>
            <dd>{card.typeName}</dd>
            <dt>Faction</dt>
            <dd>{card.factionName}</dd>
            <dt>Pack</dt>
            <dd>{card.packName}</dd>
            {card.encounterName && (
              <>
                <dt>Encounter</dt>
                <dd>{card.encounterName}</dd>
              </>
            )}
          </dl>

          {card.traits.length > 0 && (
            <div className={css.traits}>
              {card.traits.map((t) => (
                <span key={t} className={css.trait}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {card.text && (
            <div className={css.text}>{card.text}</div>
          )}

          {card.flavor && (
            <div className={css.flavor}>{card.flavor}</div>
          )}

          {card.scenarios.length > 0 && (
            <div className={css.scenarios}>
              <h2 className={css.sectionTitle}>Appears in</h2>
              <ul>
                {card.scenarios.map((s) => (
                  <li key={s.scenarioCode}>
                    <Link href={`/scenarios/${s.scenarioCode}`}>
                      {s.scenarioName}
                    </Link>
                    {" — "}
                    <Link href={`/campaigns/${s.campaignCode}`}>
                      {s.campaignName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
