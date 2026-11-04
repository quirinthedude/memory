import type { BoardConfig } from "./types";
import { createShuffleDeck } from "./deck";

export function renderBoard(container: HTMLElement, config: BoardConfig): void {
  const totalCards = config.rows * config.columns;
  const deck = createShuffleDeck(totalCards / 2);

  container.replaceChildren();
  container.classList.add("game-board");

  container.style.setProperty("--columns", String(config.columns));

  for (const [index, pairId] of deck.entries()) {
    const card = document.createElement("button");

    card.type = "button";
    card.classList.add("game-board__card");
    card.dataset.index = String(index);
    card.dataset.pairId = String(pairId);

    // Temporary visualization for testing
    card.textContent = String(pairId);

    container.appendChild(card);
  }
}
