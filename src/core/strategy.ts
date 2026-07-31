/**
 * Contrat commun à tout backend de persistance utilisé par l'AppStore.
 * Toutes les opérations sont asynchrones pour uniformiser Map, localStorage
 * (synchrones) et IndexedDB (asynchrone).
 */
export interface StorageStrategy {
  /** Récupère la valeur associée à `key`, ou `undefined` si absente. */
  get<T>(key: string): Promise<T | undefined>;
  /** Enregistre `value` sous `key`. */
  set(key: string, value: unknown): Promise<void>;
  /** Supprime l'entrée `key`. */
  remove(key: string): Promise<void>;
  /** Vide entièrement le stockage géré par cette stratégie. */
  clear(): Promise<void>;
}

/**
 * Stockage en mémoire volatile (Map). Les données sont perdues au rechargement
 * de la page. Utile en développement ou pour un état non persistant.
 */
export class VolatileStorage implements StorageStrategy {
  private readonly store = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

/**
 * Stockage persistant via `window.localStorage`. Les valeurs sont sérialisées
 * en JSON. Un préfixe évite les collisions avec d'autres clés du domaine.
 */
export class LocalStorageAdapter implements StorageStrategy {
  private readonly prefix: string;

  constructor(prefix: string = "app:") {
    this.prefix = prefix;
  }

  private prefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const raw = localStorage.getItem(this.prefixedKey(key));
    return raw === null ? undefined : (JSON.parse(raw) as T);
  }

  async set(key: string, value: unknown): Promise<void> {
    localStorage.setItem(this.prefixedKey(key), JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefixedKey(key));
  }

  async clear(): Promise<void> {
    for (const storageKey of Object.keys(localStorage)) {
      if (storageKey.startsWith(this.prefix)) {
        localStorage.removeItem(storageKey);
      }
    }
  }
}

/**
 * Stockage persistant via IndexedDB, adapté aux gros volumes de données.
 * La connexion à la base est ouverte paresseusement et réutilisée pour
 * toutes les opérations suivantes.
 */
export class IndexedDBStorage implements StorageStrategy {
  private readonly dbName: string;
  private readonly storeName: string;
  private readonly dbPromise: Promise<IDBDatabase>;

  constructor(dbName: string = "app-store", storeName: string = "kv") {
    this.dbName = dbName;
    this.storeName = storeName;
    this.dbPromise = this.openDatabase();
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    return db.transaction(this.storeName, mode).objectStore(this.storeName);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const store = await this.getStore("readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  async set(key: string, value: unknown): Promise<void> {
    const store = await this.getStore("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async remove(key: string): Promise<void> {
    const store = await this.getStore("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    const store = await this.getStore("readwrite");
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
