export type BoardSize = "small" | "medium" | "large";

export interface BoardConfig {
  rows: number;
  columns: number;
}

export const BOARD_SIZES: Record<BoardSize, BoardConfig> = {
  small: { rows: 4, columns: 4 },
  medium: { rows: 6, columns: 4 },
  large: { rows: 6, columns: 6 },
};

export interface MemoryCard {
  id: number;
  pairId: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type PlayerId = "blue" | "orange";

export interface GameState {
  cards: MemoryCard[];
  currentPlayer: "blue" | "orange";
  scores: Record<"blue" | "orange", number>;
  flippedCards: number[];
  isLocked: boolean;
}
