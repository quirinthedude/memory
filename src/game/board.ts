import type { BoardConfig, MemoryCard } from "./types";

export function renderBoard(
  container: HTMLElement,
  config: BoardConfig,
  cards: MemoryCard[],
): void {
  container.replaceChildren();
  container.classList.add("game-board");

  container.style.setProperty("--columns", String(config.columns));

  for (const memoryCard of cards) {
    const card = document.createElement("button");

    card.type = "button";
    card.classList.add("game-board__card");

    card.dataset.index = String(memoryCard.id);
    card.dataset.pairId = String(memoryCard.pairId);

    // Temporary visualization for testing
    card.textContent = String(memoryCard.pairId);

    container.appendChild(card);
  }
}
