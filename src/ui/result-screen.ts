import type { GameState, PlayerId } from "../game/types";
import type { GameSettings, Theme } from "./settings";
import confetti from "../assets/icons/code_vibes/Confetti.svg?url&no-inline";
import codeVibesScales from "../assets/icons/code_vibes/Scale-cyan.svg?url&no-inline";
import gamingTrophy from "../assets/icons/game/pockal-games.svg?url&no-inline";
import gamingScales from "../assets/icons/game/Scale-purple.svg?url&no-inline";
import daBlueWinner from "../assets/icons/da_projects/winner-blue-DA.svg?url&no-inline";
import daOrangeWinner from "../assets/icons/da_projects/winner-orange-DA.svg?url&no-inline";
import daScales from "../assets/icons/da_projects/Scale-DA.svg?url&no-inline";
import foodsBlueWinner from "../assets/icons/food/winner-blue-food.svg?url&no-inline";
import foodsOrangeWinner from "../assets/icons/food/winner-orange-food.svg?url&no-inline";
import foodsScales from "../assets/icons/food/scale-food.svg?url&no-inline";

export type GameOutcome = PlayerId | "draw" | "solo";

const decorations: Record<Theme, Record<PlayerId | "draw", string | null>> = {
  // Figma has no Code Vibes winner SVG yet; CSS keeps the existing pawn approximation.
  "code-vibes": { blue: null, orange: null, draw: codeVibesScales },
  gaming: { blue: gamingTrophy, orange: gamingTrophy, draw: gamingScales },
  "da-projects": { blue: daBlueWinner, orange: daOrangeWinner, draw: daScales },
  foods: { blue: foodsBlueWinner, orange: foodsOrangeWinner, draw: foodsScales },
};

export function getGameOutcome(state: GameState, players: GameSettings["players"]): GameOutcome {
  if (players === 1) return "solo";
  if (state.scores.blue === state.scores.orange) return "draw";
  return state.scores.blue > state.scores.orange ? "blue" : "orange";
}

export class ResultScreen {
  private timer: number | null = null;

  constructor(private container: HTMLElement) {}

  show(state: GameState, settings: GameSettings, onBack: () => void): void {
    this.dispose();
    this.container.dataset.theme = settings.theme;
    this.container.dataset.phase = "game-over";
    this.container.dataset.outcome = getGameOutcome(state, settings.players);
    this.container.innerHTML = `
      <div class="result__content" aria-live="polite">
        <h1 class="result__title" tabindex="-1">Game over</h1>
        <div class="result__score-group">
          <p class="result__score-label">Final score</p>
          <div class="result__scores">
            <span class="result__score result__score--blue">Blue <span>${state.scores.blue}</span></span>
            <span class="result__score result__score--orange">Orange <span>${state.scores.orange}</span></span>
          </div>
        </div>
      </div>
    `;
    this.focusTitle();

    this.timer = window.setTimeout(() => {
      this.timer = null;
      const outcome = getGameOutcome(state, settings.players);
      const isWinner = outcome === "blue" || outcome === "orange";
      const lead = isWinner ? "The winner is" : outcome === "draw" ? "It’s a" : "All pairs found";
      const winnerName = outcome === "blue" ? "Blue" : "Orange";
      const title = isWinner
        ? settings.theme === "code-vibes"
          ? `${winnerName.toUpperCase()} PLAYER`
          : `${winnerName} Player`
        : outcome === "draw" ? "DRAW" : "Game complete";
      const image = outcome === "solo" ? null : decorations[settings.theme][outcome];
      const decoration = image
        ? `<img class="result__decoration" src="${image}" alt="" aria-hidden="true">`
        : isWinner && settings.theme === "code-vibes"
          ? '<span class="result__decoration result__decoration--pawn" aria-hidden="true"></span>'
          : "";

      this.container.dataset.phase = "outcome";
      this.container.innerHTML = `
        <div class="result__content" aria-live="polite">
          ${isWinner && settings.theme === "code-vibes" ? `<img class="result__confetti" src="${confetti}" alt="" aria-hidden="true">` : ""}
          <p class="result__lead">${lead}</p>
          <h1 class="result__title" tabindex="-1">${title}</h1>
          ${decoration}
          <button class="result__back" type="button">${settings.theme === "code-vibes" ? "Back to start" : "Home"}</button>
        </div>
      `;
      this.container.querySelector<HTMLButtonElement>(".result__back")?.addEventListener("click", onBack);
      this.focusTitle();
    }, 1800);
  }

  dispose(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    this.container.replaceChildren();
  }

  private focusTitle(): void {
    this.container.querySelector<HTMLElement>(".result__title")?.focus();
  }
}
