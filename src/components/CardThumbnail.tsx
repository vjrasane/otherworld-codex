import { type Card } from "@/src/data/card";
import { routes } from "../routes";

const sizeClasses = {
  sm: "size-8",
  md: "size-12",
} as const;

type ThumbnailSize = keyof typeof sizeClasses;

function thumbnailTransform(
  card: Card,
  size: ThumbnailSize,
): React.CSSProperties {
  const zoom = size === "sm" ? 0.8 : 1;
  switch (card.type_code) {
    case "treachery":
      return {
        transform: `scale(${1.75 * zoom})`,
        transformOrigin: "50% 5%",
      };
    case "location":
      return {
        transform: `scale(${2.5 * zoom})`,
        transformOrigin: "50% 20%",
      };
    case "enemy":
      return {
        transform: `scale(${2.5 * zoom})`,
        transformOrigin: "50% 100%",
      };
    default:
      return {
        transform: `scale(${1.75 * zoom})`,
        transformOrigin: "50% 30%",
      };
  }
}

export const CardThumbnail: React.FC<{
  card: Card;
  size: ThumbnailSize;
  className?: string;
}> = ({ card, size, className }) => {
  return (
    <div
      className={`${sizeClasses[size]} rounded overflow-hidden shrink-0 relative ${className ?? ""}`}
    >
      <img
        src={routes.cardImage(card.meta.imageId ?? "")}
        className="absolute w-full h-auto"
        style={thumbnailTransform(card, size)}
      />
    </div>
  );
};
