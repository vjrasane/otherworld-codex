import type React from "react";
import type { Card } from "../data";
import { css } from "../styles";


const HORIZONTAL_TYPES = new Set(["act", "agenda", "investigator"]);

export const CardImage: React.FC<{ card: Card }> = ({ card }) => {
  const horizontal = HORIZONTAL_TYPES.has(card.typeCode);
  if (card.imageUrl) {
    return (
      <div style={css(s.cardImage, horizontal && s.horizontal)}>
        <img src={card.imageUrl} alt={card.name} style={s.img} />
      </div>
    );
  }
  return (
    <div style={css(s.placeholder, horizontal && s.horizontal)}>
      <span>{card.name}</span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  cardImage: {
    aspectRatio: "5 / 7",
    userSelect: "none",
  },
  horizontal: {
    aspectRatio: "7 / 5",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "8px",
  },
  placeholder: {
    aspectRatio: "5 / 7",
    background: "var(--bg-2)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    textAlign: "center",
    color: "var(--text-muted)",
  },
}

