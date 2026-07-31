import { describe, it, expect, vi } from 'vitest';
import { TagBuilder } from '../src/core/builder';

describe('TagBuilder (Pattern Builder)', () => {
  it('doit créer un élément HTML de base', () => {
    const builder = new TagBuilder('div');
    const element = builder.build();
    expect(element.tagName).toBe('DIV');
  });

  it('doit être strictement immuable', () => {
    const originalBuilder = new TagBuilder('span');
    const newBuilder = originalBuilder.withClass('active');
    
    const originalElement = originalBuilder.build();
    const newElement = newBuilder.build();

    expect(originalElement.classList.contains('active')).toBe(false);
    expect(newElement.classList.contains('active')).toBe(true);
  });

  it('doit ajouter du texte et des attributs', () => {
    const element = new TagBuilder('input')
      .withAttribute('type', 'text')
      .withText('Valeur par défaut')
      .build() as HTMLInputElement;

    expect(element.getAttribute('type')).toBe('text');
    expect(element.textContent).toBe('Valeur par défaut');
  });

  it('doit gérer les événements', () => {
    const handleClick = vi.fn(); // vi.fn() permet de simuler une fonction pour voir si elle est appelée
    
    const element = new TagBuilder('button')
      .withEvent('click', handleClick)
      .build();

    // On simule un clic
    element.click();
    
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('doit imbriquer des enfants correctement', () => {
    const child = new TagBuilder('p').build();
    const parent = new TagBuilder('div').withChild(child).build();

    expect(parent.children.length).toBe(1);
    expect(parent.children[0].tagName).toBe('P');
  });
});