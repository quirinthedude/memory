import codeVibes from "../assets/images/previews/code_vibes.svg?url";
import gaming from "../assets/images/previews/games.svg?url";
import daProjects from "../assets/images/previews/da_projects.svg?url";
import foods from "../assets/images/previews/foods.svg?url";

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
    if (input.name !== "theme") return;

    updatePreview(input.value as Theme);
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
}
