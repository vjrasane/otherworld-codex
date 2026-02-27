import type { CSSProperties } from "react";

export function css(
  ...styles: (CSSProperties | false | null | undefined)[]
): CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean));
}
