import type { GameSettings } from "../ui/settings";
import { BOARD_SIZES, type GameState } from "./types";
import { createShuffleDeck, mapDeckToCards } from "./deck";
import { renderBoard } from "./board";

let gameState: GameState | null = null;

export function initializeGame(settings: GameSettings): GameState | null {
  const board = document.querySelector<HTMLElement>("#game-board");
  if (!board) return null;

  const config = BOARD_SIZES[settings.boardSize];

  const deck = createShuffleDeck((config.rows * config.columns) / 2);

  gameState = {
    cards: mapDeckToCards(deck),
    currentPlayer: "blue",
    scores: { blue: 0, orange: 0 },
    flippedCards: [],
    isLocked: false,
  };

  renderBoard(board, config, gameState.cards);

  return gameState;
}

export function renderGameBoard(settings: GameSettings): void {
  const board = document.querySelector<HTMLElement>("#game-board");

  if (!board) return;

  //   const cardCount = sizeMap[settings.boardSize];
  const config = BOARD_SIZES[settings.boardSize];
  board.dataset.size = settings.boardSize;
}
