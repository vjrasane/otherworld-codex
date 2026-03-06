import { type Card } from "@/src/data/card";
import { CardImage } from "./CardImage";
import { CardPreview } from "./CardPreview";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
  useTransitionStyles,
} from "@floating-ui/react";

export const CardGrid: React.FC<{ cards: Card[] }> = ({ cards }) => {
  const [count, setCount] = useState(50);
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const { refs, floatingStyles, context } = useFloating({
    open: !!hoveredCard,
    placement: "top",
    middleware: [
      offset(({ rects }) => -rects.reference.height * 0.5),
      flip(),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 150,
    initial: { opacity: 0 },
  });

  const onMouseEnter = useCallback(
    (card: Card, el: HTMLElement) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        refs.setPositionReference(el);
        setHoveredCard(card);
      }, 100);
    },
    [refs],
  );

  const onMouseLeave = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setHoveredCard(null);
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setCount((c) => c + 50);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const renderedCards = useMemo(() => cards.slice(0, count), [cards, count]);

  return (
    <>
      <div style={s.grid}>
        {renderedCards.map((card) => (
          <a key={card.code} style={s.cardLink}>
            <div
              onMouseEnter={(e) => onMouseEnter(card, e.currentTarget)}
              onMouseLeave={onMouseLeave}
            >
              <CardImage card={card} />
            </div>
            <div style={s.cardName}>{card.name}</div>
          </a>
        ))}
      </div>
      <div ref={sentinelRef} />
      {isMounted && hoveredCard && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, ...transitionStyles, zIndex: 80 }}
          >
            <CardPreview card={hoveredCard} />
          </div>
        </FloatingPortal>
      )}
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
};
