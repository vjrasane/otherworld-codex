import { type Card } from "@/src/data/card";
import { routes } from "@/src/routes";
import { CardImage } from "./CardImage";
import { useEffect, useMemo, useRef, useState } from "react";

export const CardGrid = ({ cards }: { cards: Card[] }) => {
  const [count, setCount] = useState(50);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setCount((c) => c + 50);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const renderedCards = useMemo(() => cards.slice(0, count), [cards, count])

  return (
    <>
      <div style={s.grid}>
        {renderedCards.map((card) => (
          <a key={card.code} href={routes.card(card.code)} style={s.cardLink}>
            <CardImage card={card} />
            <div style={s.cardName}>{card.name}</div>
          </a>
        ))}
      </div>
      <div ref={sentinelRef} />
    </>
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

