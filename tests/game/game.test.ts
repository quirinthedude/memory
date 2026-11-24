import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { disposeGame, initializeGame } from "../../src/game/game";
import { BOARD_SIZES, type GameState } from "../../src/game/types";
import type { GameSettings } from "../../src/ui/settings";

const settings: GameSettings = { theme: "gaming", players: 2, boardSize: "small" };

function start(overrides: Partial<GameSettings> = {}) {
  const onStateChange = vi.fn<(state: GameState) => void>();
  const onComplete = vi.fn<(state: GameState) => void>();
  const state = initializeGame({ ...settings, ...overrides }, onStateChange, onComplete);
  if (!state) throw new Error("Expected #game-board to exist");
  const board = document.querySelector<HTMLElement>("#game-board")!;
  const click = (index: number) => board.querySelectorAll<HTMLButtonElement>("button")[index].click();
  const pair = (pairId: number) => state.cards.flatMap((card, index) => card.pairId === pairId ? [index] : []);
  return { state, board, click, pair, onStateChange, onComplete };
}

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="game-board"></div>';
});

afterEach(() => {
  disposeGame();
  vi.clearAllTimers();
  vi.useRealTimers();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("game", () => {
  it("returns null when the board is absent", () => {
    document.body.replaceChildren();
    const onStateChange = vi.fn();
    const onComplete = vi.fn();
    expect(initializeGame(settings, onStateChange, onComplete)).toBeNull();
    expect(onStateChange).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it.each(Object.entries(BOARD_SIZES))("initializes a %s board with the configured number of cards", (size, config) => {
    const game = start({ boardSize: size as GameSettings["boardSize"] });
    expect(game.state.cards).toHaveLength(config.rows * config.columns);
    expect(game.board.dataset.size).toBe(size);
    expect(game.board.style.getPropertyValue("--columns")).toBe(String(config.columns));
    expect(game.board.querySelectorAll("button")).toHaveLength(config.rows * config.columns);
    expect(game.state.currentPlayer).toBe("blue");
    expect(game.state.scores).toEqual({ blue: 0, orange: 0 });
  });

  it("flips the first card and ignores invalid, repeated, matched, and locked clicks", () => {
    const game = start();
    const [first, second] = game.pair(game.state.cards[0].pairId);
    const other = game.state.cards.findIndex((card) => card.pairId !== game.state.cards[0].pairId);
    game.board.click();
    document.createElement("button").click();
    expect(game.state.flippedCards).toEqual([]);

    game.click(first);
    game.click(first);
    expect(game.state.flippedCards).toEqual([first]);
    expect(game.state.cards[first].isFlipped).toBe(true);
    expect(game.board.querySelectorAll("button")[first].classList.contains("is-flipped")).toBe(true);
    expect(game.board.querySelectorAll("button")[first].getAttribute("aria-label")).toBe(`Card ${first + 1}, face up`);
    expect(game.onStateChange).not.toHaveBeenCalled();

    game.click(second);
    game.click(first);
    expect(game.state.flippedCards).toEqual([]);
    expect(game.state.scores).toEqual({ blue: 1, orange: 0 });
    expect(game.state.cards[first].isMatched).toBe(true);
    expect(game.state.cards[second].isMatched).toBe(true);
    expect(game.state.currentPlayer).toBe("blue");
    expect(game.onStateChange).toHaveBeenCalledTimes(1);
    expect(game.onStateChange).toHaveBeenCalledWith(game.state);
    expect(game.onComplete).not.toHaveBeenCalled();
    game.click(other);
    expect(game.state.flippedCards).toEqual([other]);
    expect(game.onStateChange).toHaveBeenCalledTimes(1);
  });

  it("resolves a miss only after 1000 ms, then changes player and calls back once", () => {
    const game = start();
    const callbackState: Array<{ player: string; locked: boolean; flipped: number[] }> = [];
    game.onStateChange.mockImplementation((state) => callbackState.push({
      player: state.currentPlayer,
      locked: state.isLocked,
      flipped: [...state.flippedCards],
    }));
    const second = game.state.cards.findIndex((card) => card.pairId !== game.state.cards[0].pairId);
    game.click(0);
    game.click(second);
    expect(game.state.isLocked).toBe(true);
    expect(game.state.flippedCards).toEqual([0, second]);
    const third = game.state.cards.findIndex((card) => card.pairId !== game.state.cards[0].pairId && card.id !== second);
    game.click(third);
    expect(game.state.flippedCards).toEqual([0, second]);
    expect(game.state.cards[third].isFlipped).toBe(false);
    vi.advanceTimersByTime(999);
    expect(game.state.cards[0].isFlipped).toBe(true);
    expect(game.state.currentPlayer).toBe("blue");
    expect(game.onStateChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(game.state.cards[0].isFlipped).toBe(false);
    expect(game.state.cards[second].isFlipped).toBe(false);
    expect(game.state.flippedCards).toEqual([]);
    expect(game.state.isLocked).toBe(false);
    expect(game.state.currentPlayer).toBe("orange");
    expect(game.state.scores).toEqual({ blue: 0, orange: 0 });
    expect(game.board.querySelectorAll("button")[0].getAttribute("aria-label")).toBe("Card 1, face down");
    expect(game.board.querySelectorAll("button")[second].classList.contains("is-flipped")).toBe(false);
    expect(game.onStateChange).toHaveBeenCalledOnce();
    expect(game.onStateChange).toHaveBeenCalledWith(game.state);
    expect(callbackState).toEqual([{ player: "orange", locked: true, flipped: [] }]);
    expect(game.onComplete).not.toHaveBeenCalled();
  });

  it("keeps the same player and sends no callback for a one-player miss", () => {
    const game = start({ players: 1 });
    const second = game.state.cards.findIndex((card) => card.pairId !== game.state.cards[0].pairId);
    game.click(0);
    game.click(second);
    vi.advanceTimersByTime(1000);
    expect(game.state.currentPlayer).toBe("blue");
    expect(game.state.isLocked).toBe(false);
    expect(game.onStateChange).not.toHaveBeenCalled();
  });

  it("awards the next match to orange after a two-player miss", () => {
    const game = start();
    const second = game.state.cards.findIndex((card) => card.pairId !== game.state.cards[0].pairId);
    game.click(0);
    game.click(second);
    vi.advanceTimersByTime(1000);
    const [first, partner] = game.pair(game.state.cards[0].pairId);
    game.click(first);
    game.click(partner);
    expect(game.state.scores).toEqual({ blue: 0, orange: 1 });
    expect(game.state.currentPlayer).toBe("orange");
    expect(game.onStateChange).toHaveBeenCalledTimes(2);
    expect(game.onStateChange.mock.calls.map(([state]) => state)).toEqual([game.state, game.state]);
  });

  it("reports matches before completion after 500 ms, using one mutable state reference", () => {
    const game = start();
    const order: string[] = [];
    const snapshots: number[] = [];
    const callbackLocks: boolean[] = [];
    const callbackFlips: number[][] = [];
    game.onStateChange.mockImplementation((state) => {
      order.push("state");
      snapshots.push(state.scores.blue);
      callbackLocks.push(state.isLocked);
      callbackFlips.push([...state.flippedCards]);
    });
    game.onComplete.mockImplementation(() => order.push("complete"));
    for (const pairId of new Set(game.state.cards.map((card) => card.pairId))) {
      const [first, second] = game.pair(pairId);
      game.click(first);
      game.click(second);
    }
    const pairCount = game.state.cards.length / 2;
    expect(snapshots).toEqual(Array.from({ length: pairCount }, (_, i) => i + 1));
    expect(callbackLocks).toEqual(Array(pairCount).fill(true));
    expect(callbackFlips.every((flipped) => flipped.length === 2)).toBe(true);
    expect(order).toEqual(Array(pairCount).fill("state"));
    expect(game.onStateChange.mock.calls.every(([state]) => state === game.state)).toBe(true);
    expect(game.state.scores.blue).toBe(pairCount);
    expect(game.state.isLocked).toBe(true);
    expect(game.state.cards.every((card) => card.isMatched && card.isFlipped)).toBe(true);
    expect(game.onComplete).not.toHaveBeenCalled();
    // Earlier callback arguments are the current, mutated object rather than snapshots.
    expect(game.onStateChange.mock.calls[0][0].scores.blue).toBe(pairCount);
    vi.advanceTimersByTime(499);
    expect(game.onComplete).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(order).toEqual([...Array(pairCount).fill("state"), "complete"]);
    expect(game.onComplete).toHaveBeenCalledOnce();
    expect(game.onComplete).toHaveBeenCalledWith(game.state);
  });

  it("cancels a pending miss when disposed", () => {
    const game = start();
    const second = game.state.cards.findIndex((card) => card.pairId !== game.state.cards[0].pairId);
    game.click(0);
    game.click(second);
    disposeGame();
    expect(game.board.onclick).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(1000);
    expect(game.state.cards[0].isFlipped).toBe(true);
    expect(game.onStateChange).not.toHaveBeenCalled();
  });

  it("cancels a pending completion when disposed", () => {
    const game = start();
    for (const pairId of new Set(game.state.cards.map((card) => card.pairId))) {
      const [first, second] = game.pair(pairId);
      game.click(first);
      game.click(second);
    }
    disposeGame();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(500);
    expect(game.onComplete).not.toHaveBeenCalled();
  });

  it("cancels the old timer when reinitialized and routes clicks to the new game", () => {
    const old = start();
    const second = old.state.cards.findIndex((card) => card.pairId !== old.state.cards[0].pairId);
    old.click(0);
    old.click(second);
    const fresh = start({ players: 1 });
    expect(vi.getTimerCount()).toBe(0);
    expect(fresh.state).not.toBe(old.state);
    expect(fresh.state.flippedCards).toEqual([]);
    vi.advanceTimersByTime(1000);
    expect(old.onStateChange).not.toHaveBeenCalled();
    expect(old.onComplete).not.toHaveBeenCalled();
    fresh.click(0);
    expect(fresh.state.flippedCards).toEqual([0]);
    expect(old.state.flippedCards).toEqual([0, second]);
  });

  it("cancels a pending completion when reinitialized", () => {
    const old = start();
    for (const pairId of new Set(old.state.cards.map((card) => card.pairId))) {
      const [first, second] = old.pair(pairId);
      old.click(first);
      old.click(second);
    }
    const fresh = start();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(500);
    expect(old.onComplete).not.toHaveBeenCalled();
    expect(fresh.onComplete).not.toHaveBeenCalled();
    expect(fresh.state.scores).toEqual({ blue: 0, orange: 0 });
  });
});
