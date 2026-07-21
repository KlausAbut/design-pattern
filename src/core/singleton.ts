import type { StorageStrategy } from "./strategy";
import { VolatileStorage } from "./strategy";

/**
 * Configuration globale de l'application (clé/valeur, string uniquement).
 * Instance unique accessible depuis n'importe quel module via getInstance().
 */
export class AppConfig {
  private static instance: AppConfig;
  private readonly config = new Map<string, string>();

  private constructor() {}

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  set(key: string, value: string): void {
    this.config.set(key, value);
  }

  get(key: string): string | undefined {
    return this.config.get(key);
  }
}

/**
 * Store d'état applicatif. L'état vit en mémoire pour des lectures/écritures
 * synchrones ; il est répliqué en arrière-plan vers une StorageStrategy
 * (Volatile, LocalStorage ou IndexedDB), interchangeable via setStrategy().
 */
export class AppStore {
  private static instance: AppStore;
  private state: Record<string, unknown> = {};
  private strategy: StorageStrategy;

  private constructor(strategy: StorageStrategy) {
    this.strategy = strategy;
  }

  static getInstance(
    strategy: StorageStrategy = new VolatileStorage(),
  ): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore(strategy);
    }
    return AppStore.instance;
  }

  /** Change le backend de persistance à l'exécution. */
  setStrategy(strategy: StorageStrategy): void {
    this.strategy = strategy;
  }

  /** Lecture synchrone depuis le cache mémoire. */
  getState<T>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  /** Écrit en mémoire immédiatement, puis persiste en arrière-plan. */
  setState(key: string, value: unknown): void {
    this.state[key] = value;
    void this.strategy.set(key, value);
  }

  /** Recharge une clé depuis le backend de persistance vers le cache mémoire. */
  async hydrate<T>(key: string): Promise<T | undefined> {
    const value = await this.strategy.get<T>(key);
    if (value !== undefined) {
      this.state[key] = value;
    }
    return value;
  }

  async removeState(key: string): Promise<void> {
    delete this.state[key];
    await this.strategy.remove(key);
  }

  async clear(): Promise<void> {
    this.state = {};
    await this.strategy.clear();
  }
}
