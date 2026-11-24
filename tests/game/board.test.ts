import { afterEach, describe, expect, it } from "vitest";
import { renderBoard } from "../../src/game/board";
import { BOARD_SIZES, type MemoryCard } from "../../src/game/types";

afterEach(() => document.body.replaceChildren());

describe("renderBoard", () => {
  it.each(Object.entries(BOARD_SIZES))("renders the %s board with its column count", (_size, config) => {
    const board = document.createElement("div");
    board.append(document.createElement("p"));
    document.body.append(board);
    const cards: MemoryCard[] = Array.from({ length: config.rows * config.columns }, (_, id) => ({
      id,
      pairId: Math.floor(id / 2),
      image: `front-${id}.svg`,
      isFlipped: false,
      isMatched: false,
    }));

    renderBoard(board, config, cards, "back.svg");

    expect(board.classList.contains("game-board")).toBe(true);
    expect(board.style.getPropertyValue("--columns")).toBe(String(config.columns));
    expect(board.children).toHaveLength(cards.length);
    expect(board.querySelector("p")).toBeNull();
    [...board.children].forEach((element, index) => {
      const button = element as HTMLButtonElement;
      expect(button.tagName).toBe("BUTTON");
      expect(button.type).toBe("button");
      expect(button.className).toBe("game-board__card");
      expect(button.dataset.index).toBe(String(index));
      expect(button.dataset.pairId).toBe(String(cards[index].pairId));
      expect(button.getAttribute("aria-label")).toBe(`Card ${index + 1}, face down`);
      const inner = button.firstElementChild;
      expect(inner?.className).toBe("game-board__inner");
      const images = inner?.querySelectorAll("img") ?? [];
      expect(images).toHaveLength(2);
      expect(images[0].className).toBe("game-board__face game-board__face--back");
      expect(images[1].className).toBe("game-board__face game-board__face--front");
      expect(images[0].getAttribute("src")).toBe("back.svg");
      expect(images[1].getAttribute("src")).toBe(cards[index].image);
      expect([...images].map((image) => [image.alt, image.draggable])).toEqual([["", false], ["", false]]);
    });
  });
});
