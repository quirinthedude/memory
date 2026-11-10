import type { GameSettings } from "../ui/settings";
import { BOARD_SIZES, type GameState } from "./types";
import { createShuffleDeck, mapDeckToCards } from "./deck";
import { renderBoard } from "./board";
import { getThemeConfig } from "../data/theme-config";

let gameState: GameState | null = null;

export function initializeGame(
  settings: GameSettings,
  onStateChange: (state: GameState) => void,
): GameState | null {
  const board = document.querySelector<HTMLElement>("#game-board");
  if (!board) return null;

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
    if (!(target instanceof Element)) return;

    const card = target.closest<HTMLButtonElement>(".game-board__card");
    if (!card || !board.contains(card)) return;

    const index = Number(card.dataset.index);
    const memoryCard = state.cards[index];

    //prevent invalid interactions
    if (
      !memoryCard ||
      state.isLocked ||
      memoryCard.isFlipped ||
      memoryCard.isMatched
    )
      return;

    //flip selected card
    memoryCard.isFlipped = true;
    card.classList.add("is-flipped");
    card.setAttribute("aria-label", `Card ${index + 1}, face up`);

    state.flippedCards.push(index);

    //Wait for second card
    if (state.flippedCards.length < 2) return;

    state.isLocked = true;

    const [firstIndex, secondIndex] = state.flippedCards;
    const firstCard = state.cards[firstIndex];
    const secondCard = state.cards[secondIndex];

    if (firstCard.pairId === secondCard.pairId) {
      firstCard.isMatched = true;
      secondCard.isMatched = true;

      state.scores[state.currentPlayer]++;
      onStateChange(state);

      state.flippedCards = [];
      state.isLocked = false;
      return;
    }

    //different pair -> back to game
    setTimeout(() => {
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
        state.currentPlayer =
          state.currentPlayer === "blue" ? "orange" : "blue";

        onStateChange(state);
      }

      state.isLocked = false;
    }, 1000);
  };

  return gameState;
}

export function renderGameBoard(settings: GameSettings): void {
  const board = document.querySelector<HTMLElement>("#game-board");

  if (!board) return;

  //   const cardCount = sizeMap[settings.boardSize];
  const config = BOARD_SIZES[settings.boardSize];
}
