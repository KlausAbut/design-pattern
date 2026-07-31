import { describe, it, expect, beforeEach } from 'vitest';
import { VolatileStorage } from '../src/core/strategy';

describe('Strategy Pattern (Storage)', () => {
  let storage: VolatileStorage;

  beforeEach(() => {
    storage = new VolatileStorage();
  });

  it('doit sauvegarder et récupérer une donnée asynchrone', async () => {
    await storage.set('user', 'Antonin');
    const user = await storage.get<string>('user');
    
    expect(user).toBe('Antonin');
  });

  it('doit retourner undefined si la clé n\'existe pas', async () => {
    const result = await storage.get('cle-inexistante');
    expect(result).toBeUndefined();
  });

  it('doit supprimer une clé spécifique', async () => {
    await storage.set('temp', 123);
    await storage.remove('temp');
    
    const result = await storage.get('temp');
    expect(result).toBeUndefined();
  });

  it('doit vider tout le stockage', async () => {
    await storage.set('item1', 'A');
    await storage.set('item2', 'B');
    
    await storage.clear();
    
    const item1 = await storage.get('item1');
    const item2 = await storage.get('item2');
    
    expect(item1).toBeUndefined();
    expect(item2).toBeUndefined();
  });
});