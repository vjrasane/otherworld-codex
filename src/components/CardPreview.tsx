import { type Card } from "@/src/data/card";
import { routes } from "../routes";

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

function cardTextToHtml(text: string): string {
  return text
    .replace(/\[\[(.*?)\]\]/g, "<b><em>$1</em></b>")
    .replace(/\[([\w_]+)\]/g, '<i class="icon-$1"></i>')
    .replace(/\n/g, '<div style="margin-top:0.75rem"></div>');
}

const CardText: React.FC<{ text: string }> = ({ text }) => (
  <div dangerouslySetInnerHTML={{ __html: cardTextToHtml(text) }} />
);

const StatPip: React.FC<{ icon: string; value: number | null | undefined }> = ({
  icon,
  value,
}) => {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-text-secondary">
      <i className={`icon-${icon}`} />
      <span>{value < 0 ? "X" : value}</span>
    </div>
  );
};

function EnemyStats({ card }: { card: Card }) {
  return (
    <div className="flex gap-3 mt-1.5">
      <StatPip icon="combat" value={card.enemy_fight} />
      <StatPip icon="agility" value={card.enemy_evade} />
      <StatPip icon="health" value={card.health} />
      <StatPip icon="star" value={card.enemy_damage} />
      <StatPip icon="sanity" value={card.enemy_horror} />
      {card.victory != null && card.victory > 0 && (
        <div className="ml-auto text-xs text-warning">
          Victory {card.victory}
        </div>
      )}
    </div>
  );
}

function LocationStats({ card }: { card: Card }) {
  return (
    <div className="flex gap-3 mt-1.5">
      <div className="flex items-center gap-1 text-xs text-text-secondary">
        <span className="text-text-muted">Shroud</span>
        <span>{card.shroud != null && card.shroud < 0 ? "X" : card.shroud}</span>
      </div>
      {card.clues != null && (
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <span className="text-text-muted">Clues</span>
          <span>{card.clues}</span>
          {!card.clues_fixed && card.clues > 0 && (
            <i className="icon-per_investigator" />
          )}
        </div>
      )}
      {card.victory != null && card.victory > 0 && (
        <div className="ml-auto text-xs text-warning">
          Victory {card.victory}
        </div>
      )}
    </div>
  );
}

export const CardPreview: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div className="w-80 rounded-lg overflow-hidden border border-border bg-bg-1">
      <div className="bg-encounter px-3 py-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-text-primary">
            {card.name}
          </span>
          {card.subname && (
            <span className="text-xs text-text-muted">{card.subname}</span>
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
          {card.type_code === "enemy" && <EnemyStats card={card} />}
          {card.type_code === "location" && <LocationStats card={card} />}
        </div>

        <div className="size-12 rounded border-2 border-encounter overflow-hidden shrink-0">
          <img
            src={routes.cardImage(card.meta.imageId ?? "")}
            className="w-full h-auto"
            style={thumbnailTransform(card)}
          />
        </div>
      </div>

      {card.text && (
        <div className="px-3 py-2 border-t border-border">
          <div className="border-l-2 border-text-muted pl-2 text-xs text-text-secondary leading-relaxed">
            <CardText text={card.text} />
          </div>
        </div>
      )}

      {card.flavor && (
        <div className="px-3 py-1.5 text-[0.65rem] italic text-text-muted border-t border-border">
          <CardText text={card.flavor} />
        </div>
      )}

      {card.victory != null &&
        card.victory > 0 &&
        card.type_code !== "enemy" &&
        card.type_code !== "location" && (
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
