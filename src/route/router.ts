import { Observable } from '../core/observer';

/**
 * Gère la navigation côté client sans rechargement de page (Single Page Application).
 * Utilise l'History API et le pattern Observer pour réagir aux changements d'URL.
 */
export class Router {
  // L'état actuel de la route (l'URL), géré par notre Observer !
  private currentPath: Observable<string>;
  
  // Dictionnaire associant un chemin (ex: '/about') à une fonction qui génère la vue (HTMLElement)
  private routes: Record<string, () => HTMLElement> = {};
  
  // L'élément HTML racine dans lequel on va injecter nos pages
  private outlet: HTMLElement;

  /**
   * Initialise le routeur.
   * @param outlet L'élément du DOM où les vues seront affichées (ex: <div id="app"></div>)
   */
  constructor(outlet: HTMLElement) {
    this.outlet = outlet;
    
    // On initialise l'Observable avec l'URL actuelle au chargement
    this.currentPath = new Observable<string>(window.location.pathname);

    // Écouteur pour les boutons "Précédent" et "Suivant" du navigateur (popstate)
    window.addEventListener('popstate', () => {
      this.currentPath.next(window.location.pathname);
    });

    // Le cœur du routeur : on s'abonne aux changements d'URL pour mettre à jour l'affichage
    this.currentPath.subscribe((path) => {
      this.render(path);
    });
  }

  /**
   * Enregistre une nouvelle route dans l'application.
   * @param path Le chemin de l'URL (ex: '/', '/equipes')
   * @param componentFactory Une fonction qui retourne l'élément HTML à afficher
   */
  public addRoute(path: string, componentFactory: () => HTMLElement): void {
    this.routes[path] = componentFactory;
    
    // Si la route qu'on vient d'ajouter correspond à l'URL actuelle, on l'affiche
    if (path === this.currentPath.getValue()) {
      this.render(path);
    }
  }

  /**
   * Permet de naviguer programmatiquement vers une nouvelle page.
   * @param path Le nouveau chemin
   */
  public navigate(path: string): void {
    if (path === this.currentPath.getValue()) return; // Évite de recharger la même page

    // On met à jour l'URL dans la barre du navigateur sans recharger
    window.history.pushState({}, '', path);
    
    // On prévient l'Observable que l'URL a changé (ce qui déclenchera le render via le subscribe)
    this.currentPath.next(path);
  }

  /**
   * Nettoie le conteneur et affiche la nouvelle vue.
   */
  private render(path: string): void {
    // 1. On vide le contenu actuel
    this.outlet.innerHTML = '';

    // 2. On cherche la vue correspondante (ou une route générique '*' pour la 404)
    const factory = this.routes[path] || this.routes['*'];

    // 3. On génère et on injecte le HTML
    if (factory) {
      this.outlet.appendChild(factory());
    } else {
      // Fallback de sécurité si aucune page 404 n'a été configurée
      const notFound = document.createElement('h1');
      notFound.textContent = '404 - Page non trouvée';
      this.outlet.appendChild(notFound);
    }
  }
}