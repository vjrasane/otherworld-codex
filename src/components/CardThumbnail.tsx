import { type Card } from "@/src/data/card";
import { routes } from "../routes";

const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-24",
} as const;

export type ThumbnailSize = keyof typeof sizeClasses;

function imageStyle(card: Card): React.CSSProperties {
  switch (card.type_code) {
    case "enemy":
      return { objectPosition: "center bottom" };
    case "location":
    case "treachery":
      return { objectPosition: "50% 50%", height: "250%" };
    case "agenda":
      return { objectPosition: "left center" };
    case "act":
      return { objectPosition: "right center" };
    default:
      return { objectPosition: "center top" };
  }
}

export const CardThumbnail: React.FC<{
  card: Card;
  size: ThumbnailSize;
  className?: string;
}> = ({ card, size, className }) => {
  if (!card.meta.imageId) return null;
  return (
    <div
      className={`${sizeClasses[size]} rounded overflow-hidden shrink-0 ${className ?? ""}`}
    >
      <img
        src={routes.cardImage(card.meta.imageId)}
        className="w-full h-full object-cover"
        style={imageStyle(card)}
      />
    </div>
  );
};
