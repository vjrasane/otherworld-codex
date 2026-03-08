import type { Card } from "@/src/data/card";
import type { CardPatch } from "@/src/data/pacthes";

export function hasPatch(card: Card, patch: CardPatch): boolean {
  return card.meta.patches?.includes(patch) ?? false;
}
