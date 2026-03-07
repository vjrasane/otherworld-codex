import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardDetail } from "./CardDetail";
import type { Card } from "@/src/data/card";

import { cards } from "@/src/data";

const mythosCards = cards.filter((c: Card) => !!c.encounter_code);

function random(pool: Card[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomOfType(type: string) {
  return random(mythosCards.filter((c: Card) => c.type_code === type));
}

const meta: Meta<typeof CardDetail> = {
  component: CardDetail,
  args: { open: true, onClose: () => {} },
};

export default meta;
type Story = StoryObj<typeof CardDetail>;

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

const enemies = mythosCards.filter((c: Card) => c.type_code === "enemy");

export const EnemyWithSubname: Story = {
  args: { card: random(enemies.filter((c) => !!c.subname)) },
};

export const EnemyPerPlayerHealth: Story = {
  args: { card: random(enemies.filter((c) => !!c.health_per_investigator)) },
};
