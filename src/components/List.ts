import { Component, type ComponentProps } from "./Component";

export interface ListItemProps extends ComponentProps {
  label: string;
  onSelect: (label: string) => void;
}

/** Élément de liste cliquable : reçoit son label du parent, remonte la sélection via onSelect. */
export class ListItem extends Component<ListItemProps> {
  render(): HTMLElement {
    const item = document.createElement("li");
    item.className = "list-item";
    item.textContent = this.props.label;
    item.addEventListener("click", () => this.props.onSelect(this.props.label));
    return item;
  }
}

export interface ListProps extends ComponentProps {
  items: string[];
  onSelect: (label: string) => void;
}

/** Liste générique : instancie un ListItem par entrée et relaie les sélections au parent. */
export class List extends Component<ListProps> {
  render(): HTMLElement {
    const list = document.createElement("ul");
    list.className = "list";

    for (const label of this.props.items) {
      this.mountChild(list, new ListItem({ label, onSelect: this.props.onSelect }));
    }

    return list;
  }
}
