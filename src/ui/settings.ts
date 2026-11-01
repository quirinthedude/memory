import cardBack from "../assets/icons/code_vibes/settings-card-back.svg?url";
import cardFace from "../assets/icons/code_vibes/settings-card-face.svg?url";

export type Theme = "code-vibes" | "gaming" | "da-projects" | "foods";
export type BoardSize = "small" | "medium" | "large";

export interface GameSettings {
  theme: Theme;
  players: 1 | 2;
  boardSize: BoardSize;
}

const themeNames: Record<Theme, string> = {
  "code-vibes": "Code Vibes",
  gaming: "Gaming",
  "da-projects": "DA Projects",
  foods: "Foods",
};

export function initSettings(onStart: (settings: GameSettings) => void): void {
  const form = document.querySelector<HTMLFormElement>("#game-settings");
  const preview = document.querySelector<HTMLElement>("#theme-preview");

  if (!form || !preview) return;

  function updatePreview(theme: Theme): void {
    if (!preview) return;

    preview.dataset.theme = theme;
    preview.replaceChildren();

    if (theme === "code-vibes") {
      const back = document.createElement("img");
      back.src = cardBack;
      back.alt = "";
      back.className = "settings__card settings__card--back";

      const face = document.createElement("img");
      face.src = cardFace;
      face.alt = "";
      face.className = "settings__card settings__card--face";

      preview.append(back, face);
    } else {
      // Weitere SVG-Karten werden später ergänzt.
      const placeholder = document.createElement("div");
      placeholder.className = "settings__preview-placeholder";
      placeholder.textContent = themeNames[theme];

      preview.append(placeholder);
    }
  }

  form.addEventListener("change", (event) => {
    const input = event.target;

    if (input instanceof HTMLInputElement && input.name === "theme") {
      updatePreview(input.value as Theme);
    }
  });

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

  const initialTheme =
    (form.querySelector<HTMLInputElement>('input[name="theme"]:checked')
      ?.value as Theme | undefined) ?? "code-vibes";

  updatePreview(initialTheme);
}
