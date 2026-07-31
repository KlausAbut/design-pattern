import { describe, it, expect, vi } from 'vitest';
import { Observable } from '../src/core/observer';

describe('Observable (Pattern Observer)', () => {
  it('doit s\'initialiser avec la valeur par défaut', () => {
    const obs = new Observable<number>(10);
    expect(obs.getValue()).toBe(10);
  });

  it('doit notifier immédiatement un nouvel abonné avec la valeur actuelle', () => {
    const obs = new Observable<string>('initial');
    const callback = vi.fn();
    
    obs.subscribe(callback);
    
    expect(callback).toHaveBeenCalledWith('initial');
    expect(callback).toHaveBeenCalledOnce();
  });

  it('doit notifier tous les abonnés lors d\'un next()', () => {
    const obs = new Observable<number>(0);
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    obs.subscribe(callback1);
    obs.subscribe(callback2);

    obs.next(42);

    expect(callback1).toHaveBeenCalledWith(42);
    expect(callback2).toHaveBeenCalledWith(42);
  });

  it('ne doit pas notifier si la valeur envoyée est identique (optimisation)', () => {
    const obs = new Observable<string>('test');
    const callback = vi.fn();
    
    obs.subscribe(callback);
    callback.mockClear(); // On réinitialise l'historique après le premier appel immédiat

    obs.next('test'); // Ne doit rien faire
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('doit arrêter les notifications après la désinscription (unsubscribe)', () => {
    const obs = new Observable<boolean>(false);
    const callback = vi.fn();
    
    const unsubscribe = obs.subscribe(callback);
    callback.mockClear();

    unsubscribe(); // On se désabonne
    obs.next(true); // On met à jour l'état
    
    expect(callback).not.toHaveBeenCalled();
    expect(obs.getValue()).toBe(true);
  });
});