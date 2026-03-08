import { type Card } from "./card";
import { uniq } from "lodash-es";

export type CardPatch = "flippedHorizontalLayout" | "swappedFrontAndBack";

type PatchFunc = (card: Card) => Card;

const addPatch =
  (...patches: CardPatch[]): PatchFunc =>
  (card) => ({
    ...card,
    meta: {
      ...card.meta,
      patches: uniq([...(card.meta.patches ?? []), ...patches]),
    },
  });

const patchWithCondition =
  (cond: (c: Card) => boolean, ...patches: CardPatch[]): PatchFunc =>
  (card) => {
    if (cond(card)) return addPatch(...patches)(card);
    return card;
  };

const patchWithName = (name: string, ...patches: CardPatch[]): PatchFunc =>
  patchWithCondition((c) => c.name === name, ...patches);

const patchWithCode = (code: string, ...patches: CardPatch[]): PatchFunc =>
  patchWithCondition((c) => c.code === code, ...patches);

const patches = [
  patchWithName("Shrouded Archive", "swappedFrontAndBack"),
  patchWithCode("03278", "flippedHorizontalLayout"), // The Ritual Begins
  patchWithName("The Entity Above", "flippedHorizontalLayout"),
  patchWithName("Swallowed Sky", "flippedHorizontalLayout"),
  patchWithName("Open The Path Below", "flippedHorizontalLayout"),
];

export const patch: PatchFunc = (card) =>
  patches.reduce((c, fn) => fn(c), card);
