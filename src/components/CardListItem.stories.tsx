import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardListItem } from "./CardListItem";
import type { Card } from "@/src/data/card";

import { cards } from "@/src/data";

const mythosCards = cards.filter((c: Card) => !!c.encounter_code);

function random(pool: Card[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomOfType(type: string) {
  return random(mythosCards.filter((c: Card) => c.type_code === type));
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

const enemies = mythosCards.filter((c: Card) => c.type_code === "enemy");

export const EnemyWithSubname: Story = {
  args: { card: random(enemies.filter((c) => !!c.subname)) },
};

export const EnemyPerPlayerHealth: Story = {
  args: { card: random(enemies.filter((c) => !!c.health_per_investigator)) },
};

export const EnemyXFight: Story = {
  args: { card: random(enemies.filter((c) => c.enemy_fight === -2)) },
};

export const EnemyXEvade: Story = {
  args: { card: random(enemies.filter((c) => c.enemy_evade === -2)) },
};

export const EnemyXHealth: Story = {
  args: { card: random(enemies.filter((c) => c.health === -2)) },
};

export const EnemyStarHealth: Story = {
  args: { card: random(enemies.filter((c) => c.health === -3)) },
};

export const EnemyNullHealth: Story = {
  args: { card: random(enemies.filter((c) => c.health == null)) },
};

export const EnemyWithVengeance: Story = {
  args: { card: random(enemies.filter((c) => c.vengeance != null && c.vengeance > 0)) },
};

const locations = mythosCards.filter((c: Card) => c.type_code === "location");

export const LocationXShroud: Story = {
  args: { card: random(locations.filter((c) => c.shroud === -2)) },
};

export const LocationPerPlayerClues: Story = {
  args: { card: random(locations.filter((c) => !c.clues_fixed && c.clues != null && c.clues > 0)) },
};

export const LocationFixedClues: Story = {
  args: { card: random(locations.filter((c) => c.clues_fixed === true && c.clues != null && c.clues > 0)) },
};

export const LocationDoubleSidedSameName: Story = {
  args: { card: random(locations.filter((c) => c.double_sided && !!c.backimagesrc && (!c.back_name || c.back_name === c.name))) },
};

export const LocationDoubleSidedDifferentBackName: Story = {
  args: { card: random(locations.filter((c) => c.double_sided && !!c.backimagesrc && !!c.back_name && c.back_name !== c.name)) },
};

export const LocationWithVengeance: Story = {
  args: { card: random(locations.filter((c) => c.vengeance != null && c.vengeance > 0)) },
};

export const LocationWithVictory: Story = {
  args: { card: random(locations.filter((c) => c.victory != null && c.victory > 0)) },
};

export const AgendaWithDoom: Story = {
  args: { card: random(mythosCards.filter((c) => c.type_code === "agenda" && c.doom != null && c.doom > 0)) },
};

export const MissingImage: Story = {
  args: { card: random(mythosCards.filter((c) => !c.meta.imageId)) },
};
