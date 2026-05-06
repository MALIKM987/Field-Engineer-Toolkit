import type { MeasurementFormData, ProjectFormData } from "../types";
import { isPositiveNumber, parseDecimal } from "./numbers";

type NamedValue = [label: string, value: number];

export function validateProjectInput(data: ProjectFormData): string[] {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push("Podaj nazwę projektu.");
  }

  if (!data.date) {
    errors.push("Wybierz datę projektu.");
  }

  return errors;
}

export function validateMeasurementInput(data: MeasurementFormData): string[] {
  const errors: string[] = [];
  const numericValue = parseDecimal(data.value);

  if (!data.name.trim()) {
    errors.push("Podaj nazwę pomiaru.");
  }

  if (!Number.isFinite(numericValue)) {
    errors.push("Podaj poprawną wartość liczbową.");
  }

  if (!data.unit.trim()) {
    errors.push("Podaj jednostkę.");
  }

  if (!data.timestamp) {
    errors.push("Wybierz datę i godzinę pomiaru.");
  }

  return errors;
}

export function validateFiniteInputs(values: NamedValue[]): string | null {
  const invalid = values.find(([, value]) => !Number.isFinite(value));
  return invalid ? `${invalid[0]} musi być poprawną liczbą.` : null;
}

export function validateNonZeroInputs(values: NamedValue[]): string | null {
  const finiteError = validateFiniteInputs(values);

  if (finiteError) {
    return finiteError;
  }

  const invalid = values.find(([, value]) => value === 0);
  return invalid ? `${invalid[0]} musi być różna od zera.` : null;
}

export function validatePositiveInputs(values: NamedValue[]): string | null {
  const finiteError = validateFiniteInputs(values);

  if (finiteError) {
    return finiteError;
  }

  const invalid = values.find(([, value]) => !isPositiveNumber(value));
  return invalid ? `${invalid[0]} musi być liczbą większą od zera.` : null;
}
