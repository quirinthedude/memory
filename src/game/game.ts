import type { GameSettings } from "../ui/settings";
import { BOARD_SIZES } from "./types";
import type { MemoryCard, GameState } from "./types";
import { createShuffleDeck, mapDeckToCards } from "./deck";
import { renderBoard } from "./board";
import { getThemeConfig } from "../data/theme-config";

let gameState: GameState | null = null;
let activeBoard: HTMLElement | null = null;
let pendingTimer: number | null = null;

export function disposeGame(): void {
  if (pendingTimer !== null) window.clearTimeout(pendingTimer);
  pendingTimer = null;
  if (activeBoard) activeBoard.onclick = null;
  activeBoard = null;
  gameState = null;
}

export function initializeGame(
  settings: GameSettings,
  onStateChange: (state: GameState) => void,
  onComplete: (state: GameState) => void,
): GameState | null {
  disposeGame();
  const board = document.querySelector<HTMLElement>("#game-board");
  if (!board) return null;
  activeBoard = board;

  const config = BOARD_SIZES[settings.boardSize];
  const themeConfig = getThemeConfig(settings.theme);

  board.dataset.size = settings.boardSize;

  const deck = createShuffleDeck((config.rows * config.columns) / 2);

  gameState = {
    cards: mapDeckToCards(deck, themeConfig.cardFaces),
    currentPlayer: "blue",
    scores: { blue: 0, orange: 0 },
    flippedCards: [],
    isLocked: false,
  };

  renderBoard(board, config, gameState.cards, themeConfig.cardBack);

  const state = gameState;

  board.onclick = (event) => {
    const target = event.target;

    const card = findCardButton(target);
    if (!card || !board.contains(card)) return;

    const index = Number(card.dataset.index);
    const memoryCard = state.cards[index];

    if (cannotFlipCard(memoryCard, state)) return;

    flipCard(memoryCard, card, state, index);

    //Wait for second card
    if (state.flippedCards.length < 2) return;

    state.isLocked = true;

    evaluateTurn(state, board, settings, onStateChange, onComplete);
  };
  return gameState;
}

/**
 * Finds the memory-card button associated with the click target.
 * @param target  - original event target
 * @returns closest matching card button, or null if not found
 */
function findCardButton(target: EventTarget | null): HTMLButtonElement | null {
  if (!(target instanceof Element)) return null;

  return target.closest<HTMLButtonElement>(".game-board__card");
}

/**
 *  Checks if a card interaction should be ignored
 *
 * @param memoryCard - selected memory card if so
 * @param state  - current game state
 * @returns True if the card cannot be flipped
 */
function cannotFlipCard(
  memoryCard: MemoryCard | undefined,
  state: GameState,
): boolean {
  return (
    !memoryCard ||
    state.isLocked ||
    memoryCard.isFlipped ||
    memoryCard.isMatched
  );
}

/**
 * Flips the card
 *
 * @param memoryCard - selected memory-card
 * @param card - corresponding HTML button
 * @param state - current game state
 * @param index - card's position
 */
function flipCard(
  memoryCard: MemoryCard,
  card: HTMLButtonElement,
  state: GameState,
  index: number,
): void {
  memoryCard.isFlipped = true;
  card.classList.add("is-flipped");
  card.setAttribute("aria-label", `Card ${index + 1}, face up`);
  state.flippedCards.push(index);
}

function evaluateTurn(
  state: GameState,
  board: HTMLElement,
  settings: GameSettings,
  onStateChange: (state: GameState) => void,
  onComplete: (state: GameState) => void,
): void {
  const [firstIndex, secondIndex] = state.flippedCards;
  const firstCard = state.cards[firstIndex];
  const secondCard = state.cards[secondIndex];

  if (firstCard.pairId === secondCard.pairId) {
    handleMatch(firstCard, secondCard, state, onStateChange, onComplete);
    return;
  }
  //different pair -> back to game
  pendingTimer = window.setTimeout(() => {
    pendingTimer = null;
    if (gameState !== state) return;
    firstCard.isFlipped = false;
    secondCard.isFlipped = false;

    for (const cardIndex of [firstIndex, secondIndex]) {
      const element = board.querySelector<HTMLButtonElement>(
        `.game-board__card[data-index="${cardIndex}"]`,
      );
      element?.classList.remove("is-flipped");
      element?.setAttribute("aria-label", `Card ${cardIndex + 1}, face down`);
    }

    state.flippedCards = [];

    if (settings.players === 2) {
      state.currentPlayer = state.currentPlayer === "blue" ? "orange" : "blue";

      onStateChange(state);
    }

    state.isLocked = false;
  }, 1000);
}

function handleMatch(
  firstCard: MemoryCard,
  secondCard: MemoryCard,
  state: GameState,
  onStateChange: (state: GameState) => void,
  onComplete: (state: GameState) => void,
): void {
  firstCard.isMatched = true;
  secondCard.isMatched = true;

  state.scores[state.currentPlayer]++;
  onStateChange(state);

  state.flippedCards = [];
  if (state.cards.every((card) => card.isMatched)) {
    // Keep the final pair visible until its existing 0.5s flip finishes.
    pendingTimer = window.setTimeout(() => {
      pendingTimer = null;
      if (gameState === state) onComplete(state);
    }, 500);
  } else {
    state.isLocked = false;
  }
}
