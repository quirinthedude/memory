import codeVibes from "../assets/images/previews/code_vibes.svg?url";
import gaming from "../assets/images/previews/games.svg?url";
import daProjects from "../assets/images/previews/da_projects.svg?url";
import foods from "../assets/images/previews/foods.svg?url";

const previews: Record<Theme, string> = {
  "code-vibes": codeVibes,
  gaming,
  "da-projects": daProjects,
  foods,
};

export type Theme = "code-vibes" | "gaming" | "da-projects" | "foods";
export type BoardSize = "small" | "medium" | "large";

export interface GameSettings {
  theme: Theme;
  players: 1 | 2;
  boardSize: BoardSize;
}

export function initSettings(onStart: (settings: GameSettings) => void): void {
  const form = document.querySelector<HTMLFormElement>("#game-settings");

  if (!form) return;

  const preview = document.querySelector<HTMLElement>("#theme-preview");
  const image = preview?.querySelector("img");

  function updatePreview(theme: Theme): void {
    if (!preview || !image) return;

    preview.dataset.theme = theme;
    image.src = previews[theme];
  }

  form.addEventListener("change", (event) => {
    const input = event.target;

    if (!(input instanceof HTMLInputElement)) return;
    if (input.name !== "theme") return;

    updatePreview(input.value as Theme);
  });

  updatePreview("code-vibes");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);

    const settings: GameSettings = {
      theme: data.get("theme") as Theme,
      players: Number(data.get("players")) as 1 | 2,
      boardSize: data.get("board-size") as BoardSize,
    };

    onStart(settings);
  });
}
