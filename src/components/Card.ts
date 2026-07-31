import { Component, type ComponentProps } from "./Component";

export interface CardProps extends ComponentProps {
  title: string;
}

/** Carte réutilisable : un titre fixe, et un slot `children` pour un contenu personnalisé. */
export class Card extends Component<CardProps> {
  render(): HTMLElement {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("h3");
    header.className = "card-title";
    header.textContent = this.props.title;
    card.appendChild(header);

    const body = document.createElement("div");
    body.className = "card-body";
    this.mountSlot(body);
    card.appendChild(body);

    return card;
  }
}
