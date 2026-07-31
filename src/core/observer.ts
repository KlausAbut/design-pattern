/**
 * Implémentation du pattern Observer pour la gestion de la réactivité.
 * Permet d'encapsuler une valeur et de notifier automatiquement tous les abonnés 
 * lorsque cette valeur est modifiée.
 * @example
 * // 1. Création de l'état
 * const theme = new Observable<'light' | 'dark'>('light');
 * // 2. Abonnement (Réaction au changement)
 * const unsubscribe = theme.subscribe((currentTheme) => {
 * document.body.className = currentTheme;
 * console.log(`Le thème est passé en mode : ${currentTheme}`);
 * });
 * // 3. Modification de l'état (Déclenche les notifications)
 * theme.next('dark'); 
 * // 4. Nettoyage (Si le composant est détruit)
 * unsubscribe();
 */
export class Observable<T> {
  // Liste des fonctions (callbacks) à exécuter lors d'un changement
  private subscribers: Array<(value: T) => void> = [];
  
  // Stockage de la valeur actuelle
  private currentValue: T;

  /**
   * Initialise l'Observable avec une valeur de départ.
   * @param initialValue La valeur initiale de l'état.
   */
  constructor(initialValue: T) {
    this.currentValue = initialValue;
  }

  /**
   * Permet à un composant ou un script de s'abonner aux changements de cette valeur.
   * * @param callback La fonction qui sera exécutée chaque fois que la valeur change.
   * @returns {Function} Une fonction permettant d'annuler l'abonnement (unsubscribe) 
   * pour éviter les fuites de mémoire.
   */
  public subscribe(callback: (value: T) => void): () => void {
    // On ajoute le nouvel abonné à la liste
    this.subscribers.push(callback);

    // Optionnel mais très utile : on notifie l'abonné de la valeur ACTUELLE 
    // dès le moment où il s'abonne, pour qu'il puisse s'initialiser correctement.
    callback(this.currentValue);

    // On retourne la fonction de désabonnement (closure)
    return () => {
      // On filtre le tableau pour retirer spécifiquement CE callback
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Met à jour la valeur et notifie immédiatement tous les abonnés.
   * * @param value La nouvelle valeur à stocker et à diffuser.
   */
  public next(value: T): void {
    // Si la valeur est identique, on peut éviter de notifier pour optimiser les performances
    if (this.currentValue === value) {
      return; 
    }

    this.currentValue = value;

    // On prévient tous les abonnés un par un
    this.subscribers.forEach(callback => callback(this.currentValue));
  }

  /**
   * Permet de lire la valeur de manière synchrone sans s'abonner.
   * (Méthode utilitaire très pratique pour le débogage ou une lecture unique).
   * * @returns {T} La valeur actuelle.
   */
  public getValue(): T {
    return this.currentValue;
  }
}