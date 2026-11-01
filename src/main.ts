import "@fontsource/almarai/400.css";
import "@fontsource/almarai/700.css";
import "@fontsource/almarai/800.css";
import "@fontsource/red-rose/700.css";

import "./styles/main.scss";

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
