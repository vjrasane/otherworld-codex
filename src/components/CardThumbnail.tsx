import { type Card } from "@/src/data/card";
import { routes } from "../routes";
import { hasPatch } from "./card-utils";

const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-24",
} as const;

export type ThumbnailSize = keyof typeof sizeClasses;

function imageStyle(card: Card): React.CSSProperties {
  const flipped = hasPatch(card, "flippedHorizontalLayout");
  switch (card.type_code) {
    case "enemy":
      return {
        objectPosition: "center bottom",
        transform: "scale(2)",
        transformOrigin: "center bottom",
      };
    case "treachery":
    case "location":
      return {
        objectPosition: "center 20%",
        transform: "scale(2.2)",
        transformOrigin: "center 20%",
      };
    case "asset":
      return {
        objectPosition: "center 20%",
        transform: "scale(1.9)",
        transformOrigin: "center 20%",
      };
    case "agenda": {
      const pos = flipped ? "right center" : "left center";
      return { objectPosition: pos, transform: "scale(1.9)", transformOrigin: pos };
    }
    case "act": {
      const pos = flipped ? "left center" : "right center";
      return { objectPosition: pos, transform: "scale(1.9)", transformOrigin: pos };
    }
    case "scenario":
      return {
        objectPosition: "center top",
        transform: "scale(2)",
        transformOrigin: "center top",
      };
    default:
      return { objectPosition: "center top" };
  }
}

export const CardThumbnail: React.FC<{
  card: Card;
  size: ThumbnailSize;
  className?: string;
}> = ({ card, size, className }) => {
  const imageId = hasPatch(card, "swappedFrontAndBack")
    ? card.meta.backImageId
    : card.meta.imageId;
  if (!imageId) return null;
  return (
    <div
      className={`${sizeClasses[size]} rounded overflow-hidden shrink-0 ${className ?? ""}`}
    >
      <img
        src={routes.cardImage(imageId)}
        className="w-full h-full object-cover"
        style={imageStyle(card)}
      />
    </div>
  );
};
