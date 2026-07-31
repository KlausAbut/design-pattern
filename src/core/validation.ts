import { Observable } from './observer';

// --- LES STRATÉGIES DE VALIDATION ---

export interface ValidationStrategy {
  validate(value: string): string | null;
}

export class RequiredValidator implements ValidationStrategy {
  public validate(value: string): string | null {
    return value.trim().length > 0 ? null : "Ce champ est obligatoire.";
  }
}

export class EmailValidator implements ValidationStrategy {
  public validate(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Le format de l'email est invalide.";
  }
}

export class MinLengthValidator implements ValidationStrategy {
  private readonly min: number;

  public constructor(min: number) {
    this.min = min;
  }

  public validate(value: string): string | null {
    return value.length >= this.min ? null : `Ce champ doit contenir au moins ${this.min} caractères.`;
  }
}

// --- LE CONTRÔLEUR DE CHAMP (FormControl) ---

export class FormControl {
  public readonly value: Observable<string>;
  public readonly error: Observable<string | null>;
  private readonly validators: ValidationStrategy[];

  public constructor(initialValue: string = "", validators: ValidationStrategy[] = []) {
    this.value = new Observable<string>(initialValue);
    this.error = new Observable<string | null>(null);
    this.validators = validators;

    this.value.subscribe((newValue) => {
      this.validateAll(newValue);
    });
  }

  private validateAll(currentValue: string): void {
    for (const validator of this.validators) {
      const errorMessage = validator.validate(currentValue);
      if (errorMessage !== null) {
        this.error.next(errorMessage);
        return;
      }
    }
    this.error.next(null);
  }

  public isValid(): boolean {
    return this.error.getValue() === null;
  }
}