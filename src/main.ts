import "./style.css";
import { bootstrapApp } from "./app";

const rootElement = document.querySelector<HTMLDivElement>("#app");

if (!rootElement) {
  throw new Error("#app introuvable dans index.html");
}

// On lance l'application SPA
bootstrapApp(rootElement);