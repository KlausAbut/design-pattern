import "./style.css";
import { AppConfig, AppStore } from "./core/singleton";
import { LocalStorageAdapter } from "./core/strategy";
import { TagFactory } from "./core/factory";
import { Card } from "./components/Card";
import { List } from "./components/List";

AppConfig.getInstance().set("appName", "Pétanque Manager");

const store = AppStore.getInstance(new LocalStorageAdapter());
store.setState("players", ["Alice", "Bob", "Chloé"]);

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("#app introuvable dans index.html");
}

const title = TagFactory.create("heading", {
  level: 1,
  text: AppConfig.getInstance().get("appName") ?? "Pétanque",
}).toHtml();
app.appendChild(title);

const players = store.getState<string[]>("players") ?? [];

const list = new List({
  items: players,
  onSelect: (name) => console.log(`${name} sélectionné`),
});

const card = new Card({
  title: "Joueurs inscrits",
  children: [list],
});

card.mount(app);
