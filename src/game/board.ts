import type { BoardConfig } from "./types";

export function renderBoard(container: HTMLElement, config: BoardConfig): void {
  const totalCards = config.rows * config.columns;

  container.replaceChildren();
  container.classList.add("game-board");

  container.style.setProperty("--columns", String(config.columns));

  for (let i = 0; i < totalCards; i++) {
    const card = document.createElement("button");

    card.type = "button";
    card.classList.add("game-board__card");
    card.dataset.index = String(i);

    container.appendChild(card);
  }
}
