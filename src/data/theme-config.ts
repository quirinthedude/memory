import type { Theme } from "../ui/settings";

export interface ThemeConfig {
  cardBack: string;
  cardFaces: string[];
}

const assets = import.meta.glob<string>("../assets/images/cards/*/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const folders: Record<Theme, string> = {
  "code-vibes": "code_vibes",
  gaming: "games",
  "da-projects": "DA-projects",
  foods: "food",
};

function getAsset(path: string): string {
  const url = assets[path];

  if (!url) {
    throw new Error(`SVG not found: ${path}`);
  }

  return url;
}

export function getThemeConfig(theme: Theme): ThemeConfig {
  const folder = folders[theme];
  const base = `../assets/images/cards/${folder}/`;

  const cardFaces = Array.from({ length: 18 }, (_, index) => {
    const cardNumber = index + 1;

    const filename =
      theme === "code-vibes"
        ? `code-vibes-card-${cardNumber}.svg`
        : `face${cardNumber}.svg`;

    return getAsset(base + filename);
  });

  return {
    cardBack: getAsset(base + "back.svg"),
    cardFaces,
  };
}
