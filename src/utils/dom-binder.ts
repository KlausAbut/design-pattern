import { Observable } from '../core/observer';

/**
 * Lie un Observable à la propriété texte d'un élément HTML.
 * @param element L'élément HTML cible.
 * @param observable L'état à observer.
 * @returns Une fonction pour casser la liaison (désabonnement).
 */
export function bindText(element: HTMLElement, observable: Observable<any>): () => void {
  // On s'abonne aux changements de l'Observable
  const unsubscribe = observable.subscribe((value) => {
    // À chaque changement, on met à jour le texte de l'élément en direct
    element.textContent = String(value);
  });

  // On retourne la fonction pour permettre le nettoyage de la mémoire plus tard
  return unsubscribe;
}