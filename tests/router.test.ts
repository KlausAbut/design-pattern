import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from '../src/route/router'; // Adapter le chemin selon ton dossier ("route" ou "router")

describe('Router (SPA Navigation)', () => {
  let appContainer: HTMLElement;
  let router: Router;

  // S'exécute avant chaque test pour remettre le DOM à zéro
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    appContainer = document.getElementById('app')!;
    router = new Router(appContainer);
    // On force l'URL de base pour les tests
    window.history.pushState({}, '', '/');
  });

  it('doit afficher la route par défaut (Accueil)', () => {
    router.addRoute('/', () => {
      const el = document.createElement('h1');
      el.textContent = 'Accueil';
      return el;
    });

    // Le routeur est censé l'afficher immédiatement si l'URL est '/'
    expect(appContainer.innerHTML).toContain('<h1>Accueil</h1>');
  });

  it('doit changer de vue lors de la navigation (navigate)', () => {
    router.addRoute('/', () => document.createElement('div'));
    
    router.addRoute('/joueurs', () => {
      const el = document.createElement('p');
      el.textContent = 'Liste des joueurs';
      return el;
    });

    router.navigate('/joueurs');

    expect(window.location.pathname).toBe('/joueurs');
    expect(appContainer.innerHTML).toContain('<p>Liste des joueurs</p>');
  });

  it('doit afficher la page de fallback (404) pour une route inconnue', () => {
    router.addRoute('*', () => {
      const el = document.createElement('span');
      el.textContent = 'Erreur 404';
      return el;
    });

    router.navigate('/route-inconnue-123');

    expect(appContainer.innerHTML).toContain('<span>Erreur 404</span>');
  });
});