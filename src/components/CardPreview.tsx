import { type Card } from "@/src/data/card";
import { routes } from "../routes";
import { CardThumbnail } from "./CardThumbnail";
import { CardText, EnemyStats, LocationStats, isLandscape } from "./CardParts";

export const CardPreview: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div className="w-80 rounded-lg overflow-hidden border border-border bg-bg-1">
      <div className="bg-encounter px-3 py-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-text-primary">
            {card.name}
          </span>
          {card.subname && (
            <span className="text-[0.65rem] italic text-text-muted">{card.subname}</span>
          )}
        </div>
        {card.encounter_code && (
          <img src={routes.icon(card.encounter_code)} className="size-6" />
        )}
      </div>

      <div className="flex px-3 py-2 justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-text-primary">{card.type_name}</div>
          <div className="text-xs text-text-muted">
            {card.traits?.join(". ")}
          </div>
          {card.type_code === "enemy" && (
            <EnemyStats card={card} className="mt-1.5" />
          )}
          {card.type_code === "location" && (
            <LocationStats card={card} className="mt-1.5" />
          )}
        </div>

        <CardThumbnail
          card={card}
          size="md"
          className="border-2 border-encounter"
        />
      </div>

      {isLandscape(card) && card.flavor && (
        <div className="px-3 py-2 text-xs italic text-text-secondary leading-relaxed border-t border-border">
          <CardText text={card.flavor} />
        </div>
      )}

      {card.text && (
        <div className="px-3 py-2 border-t border-border">
          <div className="border-l-2 border-text-muted pl-2 text-xs text-text-secondary leading-relaxed">
            <CardText text={card.text} />
          </div>
        </div>
      )}

      {!isLandscape(card) && card.flavor && (
        <div className="px-3 py-1.5 text-[0.65rem] italic text-text-muted border-t border-border">
          <CardText text={card.flavor} />
        </div>
      )}

      {card.victory != null && card.victory > 0 && (
        <div className="px-3 py-1.5 border-t border-border text-xs text-warning">
          Victory {card.victory}
        </div>
      )}

      <div className="flex flex-col gap-0.5 px-3 py-1.5 text-[0.65rem] text-text-muted border-t border-border">
        {card.encounter_name && card.encounter_code && (
          <span className="flex items-center gap-1">
            <img src={routes.icon(card.encounter_code)} className="size-3" />
            {card.encounter_name}
          </span>
        )}
        <span className="flex items-center gap-1">
          <i className="icon-cards" />
          {card.pack_name}
        </span>
      </div>
    </div>
  );
};
