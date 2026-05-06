import type { MeasurementFormData, ProjectFormData } from "../types";
import { isPositiveNumber, parseDecimal } from "./numbers";

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

export function validatePositiveInputs(values: Array<[string, number]>): string | null {
  const invalid = values.find(([, value]) => !isPositiveNumber(value));
  return invalid ? `${invalid[0]} musi być liczbą większą od zera.` : null;
}
