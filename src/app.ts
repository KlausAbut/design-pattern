import { Router } from "./route/router"; // Note: le nom de dossier actuel est "route"
import { TagBuilder } from "./core/builder";
import { playersState } from "./store/index";
import { Card } from "./components/Card";
import { List } from "./components/List";
import { FormControl, RequiredValidator, MinLengthValidator } from "./core/validation";
import { bindText } from "./utils/dom-binder";

export function bootstrapApp(rootElement: HTMLElement) {
  // 1. Initialisation de ton Routeur
  const router = new Router(rootElement);

  // --- VUE 1 : ACCUEIL ---
  router.addRoute("/", () => {
    return new TagBuilder("div")
      .withClass("page-accueil")
      .withChild(
        new TagBuilder("h1").withText("Pétanque Manager").build()
      )
      .withChild(
        new TagBuilder("button")
          .withText("Voir les joueurs")
          .withClass("btn-primary")
          .withEvent("click", () => router.navigate("/joueurs"))
          .build()
      )
      .build();
  });

  // --- VUE 2 : LISTE DES JOUEURS ---
  router.addRoute("/joueurs", () => {
    const page = document.createElement("div");

    // On crée un conteneur spécifique pour la carte. 
    // Cela permet de vider et re-remplir uniquement cette zone quand on supprime un joueur.
    const cardContainer = document.createElement("div");

    // Fonction pour générer et rafraîchir dynamiquement l'affichage de la liste
    const renderList = () => {
      cardContainer.innerHTML = ""; // On nettoie l'ancien affichage

      const listeJoueurs = new List({
        items: playersState.getValue(),
        onSelect: (name) => {
          // 1. On demande confirmation
          const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer le joueur ${name} ?`);
          
          if (confirmDelete) {
            // 2. On filtre le tableau pour retirer le nom sélectionné
            const currentPlayers = playersState.getValue();
            const updatedPlayers = currentPlayers.filter(p => p !== name);
            
            // 3. On met à jour l'état (ce qui sauvegarde automatiquement grâce à ton Observer)
            playersState.next(updatedPlayers);
            
            // 4. On relance le rendu de la carte pour afficher la nouvelle liste
            renderList();
          }
        },
      });

      const card = new Card({
        title: "Joueurs Inscrits",
        children: [listeJoueurs],
      });

      card.mount(cardContainer);
    };

    // On appelle la fonction une première fois pour le chargement initial
    renderList();

    // Boutons de navigation
    const navButtons = new TagBuilder("div")
      .withChild(
        new TagBuilder("button")
          .withText("Retour à l'accueil")
          .withEvent("click", () => router.navigate("/"))
          .build()
      )
      .withChild(
        new TagBuilder("button")
          .withText("Inscrire un joueur")
          .withEvent("click", () => router.navigate("/inscription"))
          .build()
      )
      .build();

    page.appendChild(cardContainer);
    page.appendChild(navButtons);

    return page;
  });

  // --- VUE 3 : FORMULAIRE D'INSCRIPTION ---
  router.addRoute("/inscription", () => {
    const page = new TagBuilder("div").withClass("page-form").build();

    // Ton FormControl avec ses stratégies de validation
    const nomControl = new FormControl("", [
      new RequiredValidator(),
      new MinLengthValidator(3),
    ]);

    // Élément d'affichage d'erreur
    const errorSpan = new TagBuilder("span").withStyle("color", "red").build();
    
    // Binding : l'erreur s'affiche automatiquement !
    bindText(errorSpan, nomControl.error);

    const inputForm = new TagBuilder("input")
      .withAttribute("type", "text")
      .withAttribute("placeholder", "Nom du joueur")
      // Binding bidirectionnel de la saisie
      .withEvent("input", (e) => {
        const val = (e.target as HTMLInputElement).value;
        nomControl.value.next(val);
      })
      .build();

    const submitBtn = new TagBuilder("button")
      .withText("Ajouter")
      .withEvent("click", () => {
        if (nomControl.isValid()) {
          const currentPlayers = playersState.getValue();
          // On émet la nouvelle valeur, le subscribe mettra le localStorage à jour automatiquement
          playersState.next([...currentPlayers, nomControl.value.getValue()]);
          router.navigate("/joueurs");
        } else {
          alert("Le formulaire contient des erreurs.");
        }
      })
      .build();

    const cancelBtn = new TagBuilder("button")
      .withText("Annuler")
      .withEvent("click", () => router.navigate("/joueurs"))
      .build();

    page.appendChild(new TagBuilder("h2").withText("Nouveau Joueur").build());
    page.appendChild(inputForm);
    page.appendChild(errorSpan);
    page.appendChild(submitBtn);
    page.appendChild(cancelBtn);

    return page;
  });
}