import type { CSSProperties } from "react";
import { routes } from "@/src/routes";

interface Props {
  code: string;
  name: string;
  onClick?: () => void;
}

const ICON_FILTER =
  "invert(73%) sepia(15%) saturate(497%) hue-rotate(169deg) brightness(95%) contrast(88%)";

export function EncounterTag({ code, name, onClick }: Props) {
  return (
    <button type="button" onClick={onClick} style={s.tag}>
      <img src={routes.icon(code)} alt="" style={s.icon} />
      {name}
    </button>
  );
}

const s = {
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    fontSize: "0.8rem",
    padding: "0.2rem 0.5rem",
    background: "var(--bg-2)",
    borderRadius: 4,
    color: "var(--text-secondary)",
    border: "none",
    cursor: "pointer",
    font: "inherit",
  },
  icon: {
    width: 14,
    height: 14,
    filter: ICON_FILTER,
  },
} satisfies Record<string, CSSProperties>;
