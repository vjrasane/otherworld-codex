import { type Card } from "@/src/data";
import { routes } from "@/src/routes";
import { CardImage } from "./CardImage";

export const CardGrid = ({ cards }: { cards: Card[] }) => {
  return (
    <div style={s.grid}>
      {cards.map((card) => (
        <a key={card.code} href={routes.card(card.code)} style={s.cardLink}>
          <CardImage card={card} />
          <div style={s.cardName}>{card.name}</div>
        </a>
      ))}
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "0.75rem",
  },
  cardLink: {
    color: "var(--text-primary)",
  },
  cardName: {
    fontSize: "0.85rem",
    marginTop: "0.25rem",
    overflow: "hidden",
    textAlign: "center",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}

