import css from "./card-image.module.css";
import { cx } from "@/utils/cx";

const HORIZONTAL_TYPES = new Set(["act", "agenda", "investigator"]);

interface CardImageProps {
  src: string;
  alt: string;
  typeCode: string;
  className?: string;
}

export function CardImage({ src, alt, typeCode, className }: CardImageProps) {
  const horizontal = HORIZONTAL_TYPES.has(typeCode);
  return (
    <img
      className={cx(css.image, horizontal && css.horizontal, className)}
      src={src}
      alt={alt}
      loading="lazy"
    />
  );
}

interface CardPlaceholderProps {
  name: string;
  typeCode: string;
  className?: string;
}

export function CardPlaceholder({ name, typeCode, className }: CardPlaceholderProps) {
  const horizontal = HORIZONTAL_TYPES.has(typeCode);
  return (
    <div className={cx(css.placeholder, horizontal && css.horizontal, className)}>
      <span>{name}</span>
    </div>
  );
}
