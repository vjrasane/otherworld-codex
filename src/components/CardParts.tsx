import { type Card, type SpecialValue } from "@/src/data/card";

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

function displayValue(
  value: number | null | undefined,
  special: SpecialValue | undefined,
): string {
  if (special) return special;
  if (value == null) return "-";
  return String(value);
}

const StatIcon: React.FC<{
  icon: string;
  value: number | null | undefined;
  special?: SpecialValue;
}> = ({ icon, value, special }) => (
  <div className="flex items-center gap-1">
    <i className={`icon-${icon}`} />
    <span>{displayValue(value, special)}</span>
  </div>
);

const StatLabel: React.FC<{
  label: string;
  value: number | null | undefined;
  special?: SpecialValue;
  children?: React.ReactNode;
}> = ({ label, value, special, children }) => (
  <div className="flex items-center gap-1">
    <span className="text-text-muted">{label}</span>
    <span>{displayValue(value, special)}</span>
    {children}
  </div>
);

export const EnemyStats: React.FC<{
  card: Card;
  className?: string;
}> = ({ card, className }) => (
  <div className={`flex gap-3 text-xs text-text-secondary ${className ?? ""}`}>
    <StatLabel label="Health" value={card.health} special={card.meta.specialHealth}>
      {card.health_per_investigator && <i className="icon-per_investigator" />}
    </StatLabel>
    <StatIcon icon="combat" value={card.enemy_fight} special={card.meta.specialEnemyFight} />
    <StatIcon icon="agility" value={card.enemy_evade} special={card.meta.specialEnemyEvade} />
    <StatIcon icon="health" value={card.enemy_damage} special={card.meta.specialEnemyDamage} />
    <StatIcon icon="sanity" value={card.enemy_horror} special={card.meta.specialEnemyHorror} />
  </div>
);

export const LocationStats: React.FC<{
  card: Card;
  className?: string;
}> = ({ card, className }) => (
  <div className={`flex gap-3 text-xs text-text-secondary ${className ?? ""}`}>
    <StatLabel label="Shroud" value={card.shroud} special={card.meta.specialShroud} />
    {card.clues != null && (
      <StatLabel label="Clues" value={card.clues} special={card.meta.specialClues}>
        {!card.clues_fixed && card.clues > 0 && (
          <i className="icon-per_investigator" />
        )}
      </StatLabel>
    )}
  </div>
);

export const CardKeywords: React.FC<{
  card: Card;
  className?: string;
}> = ({ card, className }) => {
  const keywords: string[] = [];
  if (card.victory != null && card.victory > 0)
    keywords.push(`Victory ${card.victory}`);
  if (card.vengeance != null && card.vengeance > 0)
    keywords.push(`Vengeance ${card.vengeance}`);
  if (card.doom != null && card.doom > 0)
    keywords.push(`Doom ${displayValue(card.doom, card.meta.specialDoom)}`);
  if (keywords.length === 0) return null;
  return (
    <div className={`text-text-secondary ${className ?? ""}`}>
      {keywords.join(" · ")}
    </div>
  );
};
