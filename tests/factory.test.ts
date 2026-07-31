import { describe, it, expect } from 'vitest';
import { TagFactory, ButtonTag, ImageTag } from '../src/core/factory';

describe('Factory Pattern (TagFactory)', () => {
  it('doit instancier la bonne classe selon le type demandé', () => {
    const button = TagFactory.create('button', { text: 'Cliquez-moi' });
    expect(button).toBeInstanceOf(ButtonTag);
  });

  it('doit générer le HTML correct via toHtml()', () => {
    const div = TagFactory.create('div', { class: 'container' });
    const htmlElement = div.toHtml();
    
    expect(htmlElement.tagName).toBe('DIV');
    expect(htmlElement.className).toBe('container');
  });

  it('doit appliquer les propriétés spécifiques (ex: src pour une image)', () => {
    const img = TagFactory.create('image', { src: 'logo.png' });
    const htmlElement = img.toHtml() as HTMLImageElement;
    
    expect(img).toBeInstanceOf(ImageTag);
    // jsdom résout parfois les URLs en absolu, on vérifie donc si ça "contient" logo.png
    expect(htmlElement.src).toContain('logo.png');
  });
});