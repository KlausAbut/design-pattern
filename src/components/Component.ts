/** Élément montable : soit un Component (avec cycle de vie), soit un noeud DOM brut. */
export type Renderable = Component | HTMLElement;

/** Props de base : tout composant peut recevoir des enfants via le slot `children`. */
export interface ComponentProps {
  children?: Renderable[];
  [key: string]: unknown;
}

/**
 * Classe de base du système de composants. Encapsule état (props), rendu
 * (render) et cycle de vie (onMount, onUpdate, onDestroy). Les enfants montés
 * via mountChild/mountSlot sont suivis pour que leur propre cycle de vie
 * (destroy notamment) soit propagé automatiquement.
 */
export abstract class Component<P extends ComponentProps = ComponentProps> {
  protected readonly props: P;
  private element: HTMLElement | null = null;
  private mounted = false;
  private readonly childComponents: Component[] = [];

  constructor(props: P) {
    this.props = props;
  }

  /** Construit et retourne l'élément DOM représentant ce composant. */
  abstract render(): HTMLElement;

  /** Appelé juste après l'insertion du composant dans le DOM. */
  onMount(): void {}
  /** Appelé juste après un re-render du composant. */
  onUpdate(): void {}
  /** Appelé juste avant le retrait du composant du DOM. */
  onDestroy(): void {}

  /** Monte le composant dans `parent` et déclenche onMount(). */
  mount(parent: HTMLElement): HTMLElement {
    this.element = this.render();
    parent.appendChild(this.element);
    this.mounted = true;
    this.onMount();
    return this.element;
  }

  /** Re-render le composant en place (remplace son élément dans le DOM) et déclenche onUpdate(). */
  update(): void {
    if (!this.mounted || !this.element) {
      return;
    }
    const parent = this.element.parentElement;
    this.destroyChildren();

    const newElement = this.render();
    parent?.replaceChild(newElement, this.element);
    this.element = newElement;
    this.onUpdate();
  }

  /** Retire le composant du DOM, détruit ses enfants et déclenche onDestroy(). */
  destroy(): void {
    this.destroyChildren();
    this.onDestroy();
    this.element?.remove();
    this.mounted = false;
    this.element = null;
  }

  /** Élément DOM courant du composant, ou null s'il n'est pas monté. */
  getElement(): HTMLElement | null {
    return this.element;
  }

  /** Monte un enfant (Component suivi pour son cycle de vie, ou HTMLElement brut) dans `container`. */
  protected mountChild(container: HTMLElement, child: Renderable): void {
    if (child instanceof Component) {
      this.childComponents.push(child);
      child.mount(container);
    } else {
      container.appendChild(child);
    }
  }

  /** Monte tous les enfants reçus via le slot `props.children` dans `container`. */
  protected mountSlot(container: HTMLElement): void {
    for (const child of this.props.children ?? []) {
      this.mountChild(container, child);
    }
  }

  private destroyChildren(): void {
    for (const child of this.childComponents) {
      child.destroy();
    }
    this.childComponents.length = 0;
  }
}
