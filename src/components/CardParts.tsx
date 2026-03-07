import { type Card } from "@/src/data/card";

export function isLandscape(card: Card): boolean {
  return card.type_code === "act" || card.type_code === "agenda";
}

export function cardTextToHtml(text: string): string {
  return text
    .replace(/\[\[(.*?)\]\]/g, "<b><em>$1</em></b>")
    .replace(/\[([\w_]+)\]/g, '<i class="icon-$1"></i>')
    .replace(/\n/g, '<div style="margin-top:0.75rem"></div>');
}

export const CardText: React.FC<{ text: string }> = ({ text }) => (
  <div dangerouslySetInnerHTML={{ __html: cardTextToHtml(text) }} />
);

function formatValue(value: number): string {
  return value < 0 ? "X" : String(value);
}

const StatIcon: React.FC<{
  icon: string;
  value: number | null | undefined;
}> = ({ icon, value }) => {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-1">
      <i className={`icon-${icon}`} />
      <span>{formatValue(value)}</span>
    </div>
  );
};

const StatLabel: React.FC<{
  label: string;
  value: number | null | undefined;
  children?: React.ReactNode;
}> = ({ label, value, children }) => {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-1">
      <span className="text-text-muted">{label}</span>
      <span>{formatValue(value)}</span>
      {children}
    </div>
  );
};

export const EnemyStats: React.FC<{
  card: Card;
  className?: string;
}> = ({ card, className }) => (
  <div className={`flex gap-3 text-xs text-text-secondary ${className ?? ""}`}>
    <StatLabel label="Health" value={card.health}>
      {card.health_per_investigator && <i className="icon-per_investigator" />}
    </StatLabel>
    <StatIcon icon="combat" value={card.enemy_fight} />
    <StatIcon icon="agility" value={card.enemy_evade} />
    <StatIcon icon="health" value={card.enemy_damage} />
    <StatIcon icon="sanity" value={card.enemy_horror} />
  </div>
);

export const LocationStats: React.FC<{
  card: Card;
  className?: string;
}> = ({ card, className }) => (
  <div className={`flex gap-3 text-xs text-text-secondary ${className ?? ""}`}>
    <StatLabel label="Shroud" value={card.shroud} />
    {card.clues != null && (
      <StatLabel label="Clues" value={card.clues}>
        {!card.clues_fixed && card.clues > 0 && (
          <i className="icon-per_investigator" />
        )}
      </StatLabel>
    )}
  </div>
);
