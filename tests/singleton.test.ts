import { describe, it, expect } from 'vitest';
import { AppConfig, AppStore } from '../src/core/singleton';
import { VolatileStorage } from '../src/core/strategy';

describe('Singleton Pattern (AppConfig & AppStore)', () => {
  it('AppConfig doit retourner la même instance stricte', () => {
    const config1 = AppConfig.getInstance();
    const config2 = AppConfig.getInstance();
    
    // On vérifie que c'est exactement le même objet en mémoire
    expect(config1).toBe(config2);
  });

  it('AppConfig doit sauvegarder et lire une valeur', () => {
    const config = AppConfig.getInstance();
    config.set('theme', 'dark');
    expect(config.get('theme')).toBe('dark');
  });

  it('AppStore doit retourner la même instance', () => {
    // On utilise VolatileStorage pour que le test soit rapide et en mémoire
    const store1 = AppStore.getInstance(new VolatileStorage());
    const store2 = AppStore.getInstance();
    
    expect(store1).toBe(store2);
  });
});