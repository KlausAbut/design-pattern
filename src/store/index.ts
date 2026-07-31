import { AppStore } from "../core/singleton";
import { LocalStorageAdapter } from "../core/strategy";
import { Observable } from "../core/observer";

// 1. On configure le Store global de ton binôme avec le LocalStorage (persistance)
export const globalStore = AppStore.getInstance(new LocalStorageAdapter());

// 2. On expose des états réactifs (Observables de ton côté) liés à la donnée initiale du store
// Si le store est vide (premier lancement), on initialise avec un tableau vide.
const initialPlayers = globalStore.getState<string[]>("players") ?? [];
export const playersState = new Observable<string[]>(initialPlayers);

// Chaque fois que l'observable change, on met à jour le Store de ton binôme pour sauvegarder
playersState.subscribe((players) => {
  globalStore.setState("players", players);
});