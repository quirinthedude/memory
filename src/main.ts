import "@fontsource/almarai/400.css";
import "@fontsource/almarai/700.css";
import "@fontsource/almarai/800.css";
import "@fontsource/red-rose/700.css";

import "./styles/main.scss";

import { initSettings, type GameSettings } from "./ui/settings";
import { GameHeader } from "./ui/game-header";
import { renderGameBoard } from "./game/game";

type View = "home" | "settings" | "game";

function showView(view: View): void {
  const sections = document.querySelectorAll<HTMLElement>("main > section");

  sections.forEach((section) => {
    section.hidden = section.id !== view;
  });
}

document
  .querySelector("#start-game")
  ?.addEventListener("click", () => showView("settings"));

function startGame(settings: GameSettings): void {
  const game = document.querySelector<HTMLElement>("#game");
  if (!game) return;

  game.dataset.theme = settings.theme;

  const container = game.querySelector<HTMLElement>("#game-header");
  if (!container) return;

  //initialize header
  const header = new GameHeader(container, settings.theme, () =>
    showView("home"),
  );

  // beginning oft state
  header.update({
    scores: { blue: 0, orange: 0 },
    currentPlayer: "blue",
  });

  // Initialize board
  renderGameBoard(settings);

  showView("game");
}

// use existing callback
initSettings(startGame);
