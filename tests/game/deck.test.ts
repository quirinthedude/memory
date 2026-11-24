import { describe, expect, it, vi } from "vitest";
import { createShuffleDeck, mapDeckToCards } from "../../src/game/deck";
import { BOARD_SIZES } from "../../src/game/types";

describe("deck", () => {
  it.each(Object.entries(BOARD_SIZES))("creates two of each pair for %s", (_size, config) => {
    const pairCount = (config.rows * config.columns) / 2;
    const deck = createShuffleDeck(pairCount);

    expect(deck).toHaveLength(config.rows * config.columns);
    expect(new Set(deck)).toEqual(new Set(Array.from({ length: pairCount }, (_, i) => i)));
    for (let pairId = 0; pairId < pairCount; pairId++) {
      expect(deck.filter((id) => id === pairId)).toHaveLength(2);
    }
  });

  it("uses Math.random while shuffling and maps shuffled positions to card IDs", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const deck = createShuffleDeck(3);
    const cards = mapDeckToCards(deck, ["a.svg", "b.svg", "c.svg"]);

    expect(random).toHaveBeenCalledTimes(5);
    expect(deck).not.toEqual([0, 0, 1, 1, 2, 2]);
    expect(cards).toEqual(deck.map((pairId, id) => ({
      id,
      pairId,
      image: ["a.svg", "b.svg", "c.svg"][pairId],
      isFlipped: false,
      isMatched: false,
    })));
  });
});
