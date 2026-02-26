import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { api } from "@/utils/api";
import { CardImage, CardPlaceholder } from "@/components/card-image";
import css from "./encounter.module.css";

export function EncounterSetView() {
  const { code } = useParams<{ code: string }>();

  const { data: encounterSet, isLoading } = useQuery({
    queryKey: ["encounterSet", code],
    queryFn: () => api.encounterSet(code),
  });

  if (isLoading) return <p>Loading...</p>;
  if (!encounterSet) return <p>Encounter set not found.</p>;

  return (
    <div className={css.page}>
      <h1 className={css.title}>{encounterSet.encounterName}</h1>

      {encounterSet.scenarios.length > 0 && (
        <section className={css.section}>
          <h2 className={css.sectionTitle}>Appears in</h2>
          <ul className={css.scenarios}>
            {encounterSet.scenarios.map((s) => (
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
        </section>
      )}

      <section className={css.section}>
        <h2 className={css.sectionTitle}>
          Cards ({encounterSet.cards.length})
        </h2>
        <div className={css.cards}>
          {encounterSet.cards.map((c) => (
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
