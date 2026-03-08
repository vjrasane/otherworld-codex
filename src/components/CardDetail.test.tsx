import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CardDetail } from "./CardDetail";
import { cards } from "@/src/data";

const shroudedArchive = cards.find((c) => c.code === "54045")!;
const attic = cards.find((c) => c.code === "01113")!;

function getCardImageSrc(): string | null {
  const imgs = document.querySelectorAll<HTMLImageElement>("img");
  return (
    Array.from(imgs)
      .find((img) => img.getAttribute("src")?.includes("/images/cards/"))
      ?.getAttribute("src") ?? null
  );
}

describe("CardDetail - Shrouded Archive", () => {
  afterEach(cleanup);
  it("front shows Shrouded Archive name with swapped image", () => {
    render(<CardDetail card={shroudedArchive} open onClose={() => {}} />);

    expect(screen.getByText("Shrouded Archive")).toBeDefined();
    expect(screen.getByText("Location")).toBeDefined();
    expect(screen.getByText("Shroud")).toBeDefined();
    expect(screen.getByText("Show back")).toBeDefined();
    expect(getCardImageSrc()).toMatchInlineSnapshot(`"/images/cards/54045b.png"`);
  });

  it("back shows Sanctum Doorway name with original image", () => {
    render(<CardDetail card={shroudedArchive} open onClose={() => {}} />);

    fireEvent.click(screen.getByText("Show back"));

    expect(screen.getByText("Sanctum Doorway")).toBeDefined();
    expect(screen.getByText("Show front")).toBeDefined();
    expect(screen.queryByText("Shroud")).toBeNull();
    expect(getCardImageSrc()).toMatchInlineSnapshot(`"/images/cards/54045.png"`);
  });
});

describe("CardDetail - Attic", () => {
  afterEach(cleanup);

  it("front shows Attic name with revealed image", () => {
    render(<CardDetail card={attic} open onClose={() => {}} />);

    expect(screen.getByText("Attic")).toBeDefined();
    expect(screen.getByText("Location")).toBeDefined();
    expect(screen.getByText("Shroud")).toBeDefined();
    expect(screen.getByText("Show back")).toBeDefined();
    expect(getCardImageSrc()).toMatchInlineSnapshot(`"/images/cards/01113.png"`);
  });

  it("back shows Attic with unrevealed image", () => {
    render(<CardDetail card={attic} open onClose={() => {}} />);

    fireEvent.click(screen.getByText("Show back"));

    expect(screen.getByText("Attic")).toBeDefined();
    expect(screen.getByText("Show front")).toBeDefined();
    expect(screen.queryByText("Shroud")).toBeNull();
    expect(getCardImageSrc()).toMatchInlineSnapshot(`"/images/cards/01113b.png"`);
  });
});
