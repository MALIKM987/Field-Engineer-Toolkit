import type { MeasurementFormData, ProjectFormData } from "../types";
import { isPositiveNumber, parseDecimal } from "./numbers";

type NamedValue = [label: string, value: number];

interface FormValidationMessages {
  measurementNameRequired: string;
  measurementTimestampRequired: string;
  measurementUnitRequired: string;
  measurementValueRequired: string;
  projectDateRequired: string;
  projectNameRequired: string;
}

interface NumericValidationMessages {
  finite: (label: string) => string;
  nonZero: (label: string) => string;
  positive: (label: string) => string;
}

const defaultFormMessages: FormValidationMessages = {
  measurementNameRequired: "Podaj nazwę pomiaru.",
  measurementTimestampRequired: "Wybierz datę i godzinę pomiaru.",
  measurementUnitRequired: "Podaj jednostkę.",
  measurementValueRequired: "Podaj poprawną wartość liczbową.",
  projectDateRequired: "Wybierz datę projektu.",
  projectNameRequired: "Podaj nazwę projektu.",
};

const defaultNumericMessages: NumericValidationMessages = {
  finite: (label) => `${label} musi być poprawną liczbą.`,
  nonZero: (label) => `${label} musi być różna od zera.`,
  positive: (label) => `${label} musi być liczbą większą od zera.`,
};

export function validateProjectInput(
  data: ProjectFormData,
  messages = defaultFormMessages,
): string[] {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push(messages.projectNameRequired);
  }

  if (!data.date) {
    errors.push(messages.projectDateRequired);
  }

  return errors;
}

export function validateMeasurementInput(
  data: MeasurementFormData,
  messages = defaultFormMessages,
): string[] {
  const errors: string[] = [];
  const numericValue = parseDecimal(data.value);

  if (!data.name.trim()) {
    errors.push(messages.measurementNameRequired);
  }

  if (!Number.isFinite(numericValue)) {
    errors.push(messages.measurementValueRequired);
  }

  if (!data.unit.trim()) {
    errors.push(messages.measurementUnitRequired);
  }

  if (!data.timestamp) {
    errors.push(messages.measurementTimestampRequired);
  }

  return errors;
}

export function validateFiniteInputs(
  values: NamedValue[],
  messages = defaultNumericMessages,
): string | null {
  const invalid = values.find(([, value]) => !Number.isFinite(value));
  return invalid ? messages.finite(invalid[0]) : null;
}

export function validateNonZeroInputs(
  values: NamedValue[],
  messages = defaultNumericMessages,
): string | null {
  const finiteError = validateFiniteInputs(values, messages);

  if (finiteError) {
    return finiteError;
  }

  const invalid = values.find(([, value]) => value === 0);
  return invalid ? messages.nonZero(invalid[0]) : null;
}

export function validatePositiveInputs(
  values: NamedValue[],
  messages = defaultNumericMessages,
): string | null {
  const finiteError = validateFiniteInputs(values, messages);

  if (finiteError) {
    return finiteError;
  }

  const invalid = values.find(([, value]) => !isPositiveNumber(value));
  return invalid ? messages.positive(invalid[0]) : null;
}
