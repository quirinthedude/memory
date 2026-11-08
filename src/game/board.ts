import type { BoardConfig, MemoryCard } from "./types";

export function renderBoard(
  container: HTMLElement,
  config: BoardConfig,
  cards: MemoryCard[],
  cardBack: string,
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

    const inner = document.createElement("span");
    inner.classList.add("game-board__inner");

    const back = document.createElement("img");
    back.classList.add("game-board__face", "game-board__face--back");
    back.src = cardBack;
    back.alt = "";
    back.draggable = false;

    const front = document.createElement("img");
    front.classList.add("game-board__face", "game-board__face--front");
    front.src = memoryCard.image;
    front.alt = "";
    front.draggable = false;

    card.setAttribute("aria-label", `Card ${memoryCard.id + 1}, face down`);

    inner.append(back, front);
    card.appendChild(inner);
    container.appendChild(card);
  }
}
