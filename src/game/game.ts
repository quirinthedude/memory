import type { GameSettings } from "../ui/settings";
import { BOARD_SIZES, BoardSize } from "./types";
import { renderBoard } from "./board";

export function renderGameBoard(settings: GameSettings): void {
  const board = document.querySelector<HTMLElement>("#game-board");

  if (!board) return;

  //   const cardCount = sizeMap[settings.boardSize];
  const config = BOARD_SIZES[settings.boardSize];

  renderBoard(board, config);
}
