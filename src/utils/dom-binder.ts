import { Observable } from '../core/observer';

/**
 * Lie un Observable à la propriété texte d'un élément HTML.
 * @param element L'élément HTML cible.
 * @param observable L'état à observer.
 * @returns Une fonction pour casser la liaison (désabonnement).
 */
export function bindText<T>(element: HTMLElement, observable: Observable<T>): () => void {
  const unsubscribe = observable.subscribe((value: T) => { // <-- Ajout de : T
    element.textContent = value == null ? "" : String(value);
  });
  return unsubscribe;
}