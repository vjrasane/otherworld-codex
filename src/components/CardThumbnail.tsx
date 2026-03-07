import { type Card } from "@/src/data/card";
import { routes } from "../routes";

const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-24",
} as const;

export type ThumbnailSize = keyof typeof sizeClasses;

function objectPosition(card: Card): string {
  switch (card.type_code) {
    case "enemy":
      return "center bottom";
    case "location":
    case "treachery":
      return "center top";
    case "agenda":
      return "left center";
    case "act":
      return "right center";
    default:
      return "center top";
  }
}

export const CardThumbnail: React.FC<{
  card: Card;
  size: ThumbnailSize;
  className?: string;
}> = ({ card, size, className }) => {
  return (
    <div
      className={`${sizeClasses[size]} rounded overflow-hidden shrink-0 ${className ?? ""}`}
    >
      <img
        src={routes.cardImage(card.meta.imageId ?? "")}
        className="w-full h-full object-cover"
        style={{ objectPosition: objectPosition(card) }}
      />
    </div>
  );
};
