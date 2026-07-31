// L'interface commune pour toutes nos stratégies de validation
export interface ValidationStrategy {
  /**
   * Vérifie une valeur et retourne un message d'erreur si elle est invalide, ou null si tout va bien.
   */
  validate(value: string): string | null;
}

// Stratégie 1 : Champ requis
export class RequiredValidator implements ValidationStrategy {
  public validate(value: string): string | null {
    return value.trim().length > 0 ? null : "Ce champ est obligatoire.";
  }
}

// Stratégie 2 : Format Email
export class EmailValidator implements ValidationStrategy {
  public validate(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Le format de l'email est invalide.";
  }
}

// Stratégie 3 : Longueur minimum (avec un paramètre dans le constructeur)
export class MinLengthValidator implements ValidationStrategy {
  private readonly min: number;

  public constructor(min: number) {
    this.min = min;
  }

  public validate(value: string): string | null {
    return value.length >= this.min ? null : `Ce champ doit contenir au moins ${this.min} caractères.`;
  }
}