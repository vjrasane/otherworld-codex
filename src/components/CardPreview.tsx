import { type Card } from "@/src/data/card";
import { routes } from "../routes";

const HORIZONTAL_TYPES = ["act", "agenda", "investigator"];

function thumbnailTransform(card: Card): React.CSSProperties {
  switch (card.type_code) {
    case "treachery":
      return { transform: "scale(1.75)", transformOrigin: "50% 5%" };
    case "location":
      return { transform: "scale(2.5)", transformOrigin: "50% 20%" };
    case "enemy":
      return { transform: "scale(2.5)", transformOrigin: "50% 100%" };
    default:
      return { transform: "scale(1.75)", transformOrigin: "50% 30%" };
  }
}

export const CardPreview: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div className="w-80 rounded-lg overflow-hidden border border-border bg-bg-1">
      {/* header */}
      <div className="bg-encounter px-3 py-2 flex  items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-text-primary">
            {card.name}
          </span>
          <span className="text-xs text-text-muted">{card.subname}</span>
        </div>
        <img src={routes.icon(card.encounter_code!)} className="size-6" />
      </div>

      {/* details */}
      <div className="flex px-3 py-2 justify-between items-center">
        <div className="flex flex-col">
          <div className="text-sm text-text-primary">{card.type_name}</div>
          <div className="text-xs text-text-muted">
            {card.traits?.join(". ")}
          </div>
        </div>

        <div className="size-12 rounded border-2 border-encounter overflow-hidden">
          <img
            src={routes.cardImage(card.meta.imageId ?? "")}
            className="w-full h-auto"
            style={thumbnailTransform(card)}
          />
        </div>
      </div>

      {/* text */}
      <div className="flex flex-col px-3 py-2 justify-between"></div>
    </div>
  );
};
