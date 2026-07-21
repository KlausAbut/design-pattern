/**
 * @class TagBuilder
 * @description Un constructeur fluent et **strictement immuable** pour générer des éléments HTML.
 * Contrairement à un Builder traditionnel, cette classe ne modifie jamais son état interne.
 * Chaque appel à une méthode `with...` ou `without...` crée et retourne une **nouvelle instance** * de `TagBuilder`. L'instance d'origine reste totalement inchangée.
 * * @example
 * // 🛑 PIÈGE CLASSIQUE (À ne pas faire)
 * const builder = new TagBuilder('button');
 * builder.withClass('btn-primary'); // ❌ L'instance 'builder' n'est PAS modifiée !
 * const el = builder.build();       // ❌ Génère un <button> vide, sans la classe.
 * * @example
 * // ✅ BONNE UTILISATION : Le chaînage direct
 * const button = new TagBuilder('button')
 * .withClass('btn-primary') // Retourne un NOUVEAU builder
 * .withText('Confirmer')    // Retourne encore un NOUVEAU builder
 * .build();                 // Résultat : <button class="btn-primary">Confirmer</button>
 * * @example
 * // ✅ BONNE UTILISATION : Partage d'un modèle de base (Le vrai pouvoir de l'immuabilité)
 * const baseInput = new TagBuilder('input').withClass('form-field');
 * * // On crée deux boutons différents sans qu'ils ne se parasitent entre eux :
 * const nameInput = baseInput.withAttribute('type', 'text').build();
 * const passwordInput = baseInput.withAttribute('type', 'password').build();
 */
export class TagBuilder {
  private readonly tag: string;
  private readonly textContent: string;
  private readonly classes: string[];
  private readonly styles: Record<string, string>;
  private readonly events: Array<{ name: string; handler: EventListener }>;
  private readonly children: HTMLElement[];
  private readonly attributes: Record<string, string>; // 1. Ajout de la propriété

  public constructor(
    tag: string,
    textContent: string = "",
    classes: string[] = [],
    styles: Record<string, string> = {},
    events: Array<{ name: string; handler: EventListener }> = [],
    children: HTMLElement[] = [],
    attributes: Record<string, string> = {} // 2. Ajout au constructeur
  ) {
    this.tag = tag;
    this.textContent = textContent;
    this.classes = classes;
    this.styles = styles;
    this.events = events;
    this.children = children;
    this.attributes = attributes; // 3. Assignation
  }

  public withText(text: string): TagBuilder {
    return new TagBuilder(this.tag, text, this.classes, this.styles, this.events, this.children, this.attributes);
  }
  /**
   * Ajoute une classe CSS à la configuration de l'élément.
   * * @param {string} className - Le nom de la classe à ajouter.
   * @returns {TagBuilder} Une **nouvelle instance** de TagBuilder contenant la classe ajoutée, 
   * laissant l'instance actuelle intacte.
   */
  public withClass(className: string): TagBuilder {
    return new TagBuilder(
      this.tag,
      this.textContent,
      [...this.classes, className],
      this.styles,
      this.events,
      this.children,
      this.attributes
    );
  }

  /**
   * Retire une classe CSS de la configuration de l'élément.
   * * @param {string} className - Le nom de la classe à retirer.
   * @returns {TagBuilder} Une **nouvelle instance** de TagBuilder sans la classe spécifiée.
   */
  public withoutClass(className: string): TagBuilder {
    return new TagBuilder(
      this.tag,
      this.textContent,
      this.classes.filter(c => c !== className),
      this.styles,
      this.events,
      this.children,
      this.attributes
    );
  }

  public withStyle(property: string, value: string): TagBuilder {
    return new TagBuilder(
      this.tag,
      this.textContent,
      this.classes,
      { ...this.styles, [property]: value },
      this.events,
      this.children,
      this.attributes
    );
  }

  // Évolution 1 : Gestion des attributs HTML
  public withAttribute(name: string, value: string): TagBuilder {
    return new TagBuilder(
      this.tag,
      this.textContent,
      this.classes,
      this.styles,
      this.events,
      this.children,
      { ...this.attributes, [name]: value }
    );
  }

  // Évolution 2 : Typage strict des événements (Correction appliquée ici)
  public withEvent<K extends keyof HTMLElementEventMap>(
    name: K,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
  ): TagBuilder {
    return new TagBuilder(
      this.tag,
      this.textContent,
      this.classes,
      this.styles,
      // On utilise 'as string' et 'as EventListener' pour satisfaire le stockage interne
      [...this.events, { name: name as string, handler: handler as EventListener }],
      this.children,
      this.attributes
    );
  }

  public withoutEvent(name: string): TagBuilder {
    return new TagBuilder(
      this.tag,
      this.textContent,
      this.classes,
      this.styles,
      this.events.filter(e => e.name !== name),
      this.children,
      this.attributes
    );
  }

  public withChild(child: HTMLElement): TagBuilder {
    return new TagBuilder(
      this.tag,
      this.textContent,
      this.classes,
      this.styles,
      this.events,
      [...this.children, child],
      this.attributes
    );
  }

  // Évolution 3 : Support des tableaux d'enfants
  public withChildren(children: HTMLElement[]): TagBuilder {
    return new TagBuilder(
      this.tag,
      this.textContent,
      this.classes,
      this.styles,
      this.events,
      [...this.children, ...children],
      this.attributes
    );
  }

  /**
   * compile toute la configuration accumulée et instancie le véritable élément du DOM.
   * Cette méthode consomme la configuration finale pour produire l'objet HTML mutable.
   * * @returns {HTMLElement} L'élément HTML natif configuré et prêt à être injecté dans le DOM.
   */
  public build(): HTMLElement {
    const element = document.createElement(this.tag);

    if (this.textContent) {
      element.textContent = this.textContent;
    }

    this.classes.forEach(c => element.classList.add(c));

    Object.entries(this.styles).forEach(([prop, val]) => {
      element.style.setProperty(prop, val);
    });

    Object.entries(this.attributes).forEach(([name, val]) => {
      element.setAttribute(name, val); // Application des attributs au DOM
    });

    this.events.forEach(({ name, handler }) => {
      element.addEventListener(name, handler);
    });

    this.children.forEach(child => {
      element.appendChild(child);
    });

    return element;
  }
}