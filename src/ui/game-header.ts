import type { PlayerId } from "../game/types";

export interface GameHeaderState {
  scores: Record<PlayerId, number>;
  currentPlayer: PlayerId;
}

export class GameHeader {
  private root: HTMLElement;

  constructor(container: HTMLElement, theme: string, onExit: () => void) {
    container.innerHTML = `
      <header class="game-header" data-theme="${theme}">
        <div class="game-header__scores">
          <span class="game-header__score game-header__score--orange">
            <span class="game-header__label">Orange</span>
            <span data-score="orange">0</span>
          </span>

          <span class="game-header__score game-header__score--blue">
            <span class="game-header__label">Blue</span>
            <span data-score="blue">0</span>
          </span>
        </div>

        <div class="game-header__current">
          Current player:
          <span class="game-header__active" data-player="blue">♙</span>
        </div>

        <button class="game-header__exit" type="button">
          Exit game
        </button>
      </header>
    `;

    this.root = container.querySelector<HTMLElement>(".game-header")!;
    //
    this.root
      .querySelector<HTMLButtonElement>(".game-header__exit")!
      .addEventListener("click", onExit);
  }

  update(state: GameHeaderState): void {
    for (const player of ["blue", "orange"] as const) {
      this.root.querySelector<HTMLElement>(
        `[data-score="${player}"]`,
      )!.textContent = String(state.scores[player]);
    }

    const active = this.root.querySelector<HTMLElement>(
      ".game-header__active",
    )!;

    active.dataset.player = state.currentPlayer;
  }
}
