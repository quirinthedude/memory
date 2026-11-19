import "@fontsource/almarai/400.css";
import "@fontsource/almarai/700.css";
import "@fontsource/almarai/800.css";
import "@fontsource/red-rose/700.css";
import "@fontsource/orbitron/700.css";
import "@fontsource/figtree/700.css";
import "@fontsource/delius-unicase/700.css";
import "@fontsource/klee-one/600.css";

import "./styles/main.scss";

import { initSettings, type GameSettings } from "./ui/settings";
import { GameHeader } from "./ui/game-header";
import { disposeGame, initializeGame } from "./game/game";
import { ResultScreen } from "./ui/result-screen";

type View = "home" | "settings" | "game" | "result";

const resultContainer = document.querySelector<HTMLElement>("#result");
const resultScreen = resultContainer ? new ResultScreen(resultContainer) : null;

function showView(view: View): void {
  const sections = document.querySelectorAll<HTMLElement>("main > section");

  sections.forEach((section) => {
    section.hidden = section.id !== view;
  });
}

document
  .querySelector("#start-game")
  ?.addEventListener("click", () => showView("settings"));

function returnHome(): void {
  disposeGame();
  resultScreen?.dispose();
  showView("home");
  document.querySelector<HTMLButtonElement>("#start-game")?.focus();
}

function startGame(settings: GameSettings): void {
  resultScreen?.dispose();
  const game = document.querySelector<HTMLElement>("#game");
  if (!game) return;

  const container = game.querySelector<HTMLElement>("#game-header");
  if (!container) return;

  let header: GameHeader | null = null;

  const state = initializeGame(
    settings,
    (state) => header?.update(state),
    (state) => {
      showView("result");
      resultScreen?.show(state, settings, returnHome);
    },
  );
  if (!state) return;

  game.dataset.theme = settings.theme;

  //initialize header
  header = new GameHeader(container, settings.theme, returnHome);

  // beginning oft state
  header.update(state);

  showView("game");
}

// use existing callback
initSettings(startGame);
