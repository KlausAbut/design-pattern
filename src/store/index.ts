import { AppStore } from "../core/singleton";
import { LocalStorageAdapter } from "../core/strategy";
import { Observable } from "../core/observer";

// 1. On configure le Store global de ton binôme avec le LocalStorage (persistance)
export const globalStore = AppStore.getInstance(new LocalStorageAdapter());

// 2. On expose des états réactifs (Observables de ton côté) liés à la donnée initiale du store
// getState() ne lit que le cache mémoire (vide au premier chargement) : il faut d'abord
// hydrater le Singleton depuis le localStorage (asynchrone) avant de créer l'Observable.
const initialPlayers = (await globalStore.hydrate<string[]>("players")) ?? [];
export const playersState = new Observable<string[]>(initialPlayers);

// Chaque fois que l'observable change, on met à jour le Store de ton binôme pour sauvegarder
playersState.subscribe((players) => {
  globalStore.setState("players", players);
});