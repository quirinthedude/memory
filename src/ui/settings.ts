import codeVibes from "../assets/images/previews/code_vibes.svg?url";
import gaming from "../assets/images/previews/games.svg?url";
import daProjects from "../assets/images/previews/da_projects.svg?url";
import foods from "../assets/images/previews/foods.svg?url";
import line2 from "../assets/icons/line2.svg?url";
import line4 from "../assets/icons/line4.svg?url";

export type Theme = "code-vibes" | "gaming" | "da-projects" | "foods";
export type BoardSize = "small" | "medium" | "large";

/**
 * configuration
 */
export interface GameSettings {
  theme: Theme;
  players: 1 | 2;
  boardSize: BoardSize;
}

/**
 * placing themes to their svg-preview
 */
const previews: Record<Theme, string> = {
  "code-vibes": codeVibes,
  gaming,
  "da-projects": daProjects,
  foods,
};

/**
 * Actualization of the preview
 * @param theme - the preview of the theme
 */
function updatePreview(theme: Theme): void {
  const preview = document.querySelector<HTMLElement>("#theme-preview");
  const image = preview?.querySelector("img");

  if (!preview || !image) return;

  preview.dataset.theme = theme;
  image.src = previews[theme];
}

/**
 * reads the chosen settings from form
 * @param form - settings-form
 * @returns configuration of memory-game
 */
function readGameSettings(form: HTMLFormElement): GameSettings {
  const data = new FormData(form);

  return {
    theme: data.get("theme") as Theme,
    players: Number(data.get("players")) as 1 | 2,
    boardSize: data.get("board-size") as BoardSize,
  };
}

/**
 * Initialize settings-form and its eventListeners
 * @param onStart callback on start
 */
export function initSettings(onStart: (settings: GameSettings) => void): void {
  const form = document.querySelector<HTMLFormElement>("#game-settings");
  if (!form) return;

  // decission for themes
  form.addEventListener("change", (event) => {
    const input = event.target;

    if (!(input instanceof HTMLInputElement)) return;

    if (input.type !== "radio") return;
    if (input.name === "theme") {
      updatePreview(input.value as Theme);
    }
    updateSettingsProgress(form);
  });

  // start of game
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    onStart(readGameSettings(form));
  });

  // initiating preview
  const initialTheme = form.querySelector<HTMLInputElement>(
    'input[name="theme"]:checked',
  );

  if (initialTheme) {
    updatePreview(initialTheme.value as Theme);
  }
  updateSettingsProgress(form);
}

/**
 * Updates the selection summary, progress arrows
 * and availibity of start button;
 * @param form - settings-form
 */
function updateSettingsProgress(form: HTMLFormElement): void {
  const theme = form.querySelector<HTMLInputElement>(
    'input[name="theme"]:checked',
  );
  const player = form.querySelector<HTMLInputElement>(
    'input[name="players"]:checked',
  );
  const board = form.querySelector<HTMLInputElement>(
    'input[name="board-size"]:checked',
  );

  const themeArrow = document.querySelector<HTMLImageElement>("#theme");
  const playerArrow = document.querySelector<HTMLImageElement>("#player");
  const startButton =
    document.querySelector<HTMLButtonElement>("#start-memory-game");

  if (themeArrow) themeArrow.src = theme ? line4 : line2;
  if (playerArrow) playerArrow.src = player ? line4 : line2;

  if (startButton) {
    startButton.disabled = !(theme && player && board);
  }

  const selection = [
    { input: theme, id: "#theme-summary", fallback: "Game theme" },
    { input: player, id: "#player-summary", fallback: "Player" },
    { input: board, id: "#board-summary", fallback: "Board size" },
  ];

  selection.forEach(({ input, id, fallback }) => {
    const element = document.querySelector<HTMLElement>(id);
    if (!element) return;

    element.textContent =
      input?.closest("label")?.textContent?.trim() || fallback;
  });
}
