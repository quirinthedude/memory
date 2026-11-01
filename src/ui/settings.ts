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
