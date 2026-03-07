import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardListItem } from "./CardListItem";
import type { Card } from "@/src/data/card";

import { cards } from "@/src/data";

const mythosCards = cards.filter((c: Card) => !!c.encounter_code);

function randomOfType(type: string) {
  const pool = mythosCards.filter((c: Card) => c.type_code === type);
  return pool[Math.floor(Math.random() * pool.length)];
}

const meta: Meta<typeof CardListItem> = {
  component: CardListItem,
};

export default meta;
type Story = StoryObj<typeof CardListItem>;

export const Enemy: Story = {
  args: { card: randomOfType("enemy") },
};

export const Location: Story = {
  args: { card: randomOfType("location") },
};

export const Treachery: Story = {
  args: { card: randomOfType("treachery") },
};

export const Act: Story = {
  args: { card: randomOfType("act") },
};

export const Agenda: Story = {
  args: { card: randomOfType("agenda") },
};
