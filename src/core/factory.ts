/** Handlers d'événements DOM par nom d'événement (ex: "click", "input"). */
export interface TagEvents {
  [eventName: string]: EventListener;
}

/** Configuration commune à tous les tags produits par la Factory. */
export interface TagConfig {
  id?: string;
  class?: string | string[];
  text?: string;
  src?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: HTMLElement[];
  attributes?: Record<string, string>;
  events?: TagEvents;
}

/** Représente un élément HTML instanciable, produisant un noeud DOM réel via toHtml(). */
export interface Tag {
  toHtml(): HTMLElement;
}

/**
 * Base commune à tous les tags concrets : applique la config générique
 * (id, classes, texte, attributs, événements, enfants). Les sous-classes
 * ne gèrent que leurs particularités via applySpecific().
 */
abstract class BaseTag implements Tag {
  protected readonly tagName: string;
  protected readonly config: TagConfig;

  protected constructor(tagName: string, config: TagConfig) {
    this.tagName = tagName;
    this.config = config;
  }

  toHtml(): HTMLElement {
    const element = document.createElement(this.tagName);
    this.applyCommon(element);
    this.applySpecific(element);
    return element;
  }

  private applyCommon(element: HTMLElement): void {
    if (this.config.id) {
      element.id = this.config.id;
    }
    if (this.config.class) {
      const classes = Array.isArray(this.config.class)
        ? this.config.class
        : [this.config.class];
      element.classList.add(...classes);
    }
    if (this.config.text) {
      element.textContent = this.config.text;
    }
    if (this.config.attributes) {
      for (const [name, value] of Object.entries(this.config.attributes)) {
        element.setAttribute(name, value);
      }
    }
    if (this.config.events) {
      for (const [eventName, handler] of Object.entries(this.config.events)) {
        element.addEventListener(eventName, handler);
      }
    }
    if (this.config.children) {
      element.append(...this.config.children);
    }
  }

  /** Hook pour les particularités d'un tag (src d'une image, type d'un input...). */
  protected applySpecific(_element: HTMLElement): void {}
}

export class DivTag extends BaseTag {
  constructor(config: TagConfig = {}) {
    super("div", config);
  }
}

export class SpanTag extends BaseTag {
  constructor(config: TagConfig = {}) {
    super("span", config);
  }
}

export class ParagraphTag extends BaseTag {
  constructor(config: TagConfig = {}) {
    super("p", config);
  }
}

export class ButtonTag extends BaseTag {
  constructor(config: TagConfig = {}) {
    super("button", config);
  }
}

export class HorizontalRuleTag extends BaseTag {
  constructor(config: TagConfig = {}) {
    super("hr", config);
  }
}

export class ImageTag extends BaseTag {
  constructor(config: TagConfig = {}) {
    super("img", config);
  }

  protected override applySpecific(element: HTMLElement): void {
    if (this.config.src) {
      (element as HTMLImageElement).src = this.config.src;
    }
  }
}

export class InputTag extends BaseTag {
  constructor(config: TagConfig = {}) {
    super("input", config);
  }

  protected override applySpecific(element: HTMLElement): void {
    const input = element as HTMLInputElement;
    if (this.config.type) {
      input.type = this.config.type;
    }
    if (this.config.placeholder) {
      input.placeholder = this.config.placeholder;
    }
    if (this.config.value) {
      input.value = this.config.value;
    }
  }
}

export class HeadingTag extends BaseTag {
  constructor(config: TagConfig = {}) {
    super(`h${config.level ?? 1}`, config);
  }
}

/** Types d'éléments instanciables par la TagFactory. */
export type ElementType =
  | "button"
  | "div"
  | "image"
  | "hr"
  | "input"
  | "heading"
  | "span"
  | "paragraph";

type TagConstructor = new (config?: TagConfig) => Tag;

const TAG_REGISTRY: Record<ElementType, TagConstructor> = {
  button: ButtonTag,
  div: DivTag,
  image: ImageTag,
  hr: HorizontalRuleTag,
  input: InputTag,
  heading: HeadingTag,
  span: SpanTag,
  paragraph: ParagraphTag,
};

/** Instancie rapidement un Tag à partir de son type, sans if/switch. */
export class TagFactory {
  static create(type: ElementType, config: TagConfig = {}): Tag {
    const TagClass = TAG_REGISTRY[type];
    return new TagClass(config);
  }
}
