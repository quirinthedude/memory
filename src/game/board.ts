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
    const card = createCardElement(memoryCard, cardBack);
    container.appendChild(card);
  }
}

function createCardElement(
  memoryCard: MemoryCard,
  cardBack: string,
): HTMLButtonElement {
  const button = createButton(memoryCard);

  const inner = document.createElement("span");
  inner.classList.add("game-board__inner");

  const back = createImg(cardBack, "back");
  const front = createImg(memoryCard.image, "front");

  inner.append(back, front);
  button.appendChild(inner);

  return button;
}

function createButton(memoryCard: MemoryCard): HTMLButtonElement {
  const card = document.createElement("button");
  card.type = "button";
  card.classList.add("game-board__card");

  card.dataset.index = String(memoryCard.id);
  card.dataset.pairId = String(memoryCard.pairId);

  card.setAttribute("aria-label", `Card ${memoryCard.id + 1}, face down`);

  return card;
}

function createImg(src: string, label: "back" | "front"): HTMLImageElement {
  const drawnPicture = document.createElement("img");
  drawnPicture.classList.add("game-board__face", "game-board__face--" + label);
  drawnPicture.src = src;
  drawnPicture.alt = "";
  drawnPicture.draggable = false;

  return drawnPicture;
}
