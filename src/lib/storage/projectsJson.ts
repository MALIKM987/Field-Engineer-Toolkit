import type { Measurement, Project } from "../../types";

type ParseProjectsJsonResult =
  | { ok: true; projects: Project[] }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDate(value: string): boolean {
  return Number.isFinite(new Date(value).getTime());
}

function validateMeasurement(value: unknown, projectIndex: number, measurementIndex: number): Measurement {
  if (!isRecord(value)) {
    throw new Error(`Pomiar ${measurementIndex + 1} w projekcie ${projectIndex + 1} ma niepoprawny format.`);
  }

  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.unit !== "string" ||
    typeof value.comment !== "string" ||
    typeof value.timestamp !== "string"
  ) {
    throw new Error(`Pomiar ${measurementIndex + 1} w projekcie ${projectIndex + 1} ma brakujące pola tekstowe.`);
  }

  if (typeof value.value !== "number" || !Number.isFinite(value.value)) {
    throw new Error(`Pomiar ${measurementIndex + 1} w projekcie ${projectIndex + 1} ma niepoprawną wartość.`);
  }

  if (!isValidDate(value.timestamp)) {
    throw new Error(`Pomiar ${measurementIndex + 1} w projekcie ${projectIndex + 1} ma niepoprawną datę.`);
  }

  return {
    id: value.id,
    name: value.name,
    value: value.value,
    unit: value.unit,
    comment: value.comment,
    timestamp: value.timestamp,
  };
}

function validateProject(value: unknown, projectIndex: number): Project {
  if (!isRecord(value)) {
    throw new Error(`Projekt ${projectIndex + 1} ma niepoprawny format.`);
  }

  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.description !== "string" ||
    typeof value.date !== "string"
  ) {
    throw new Error(`Projekt ${projectIndex + 1} ma brakujące pola tekstowe.`);
  }

  if (!isValidDate(value.date)) {
    throw new Error(`Projekt ${projectIndex + 1} ma niepoprawną datę.`);
  }

  if (!Array.isArray(value.measurements)) {
    throw new Error(`Projekt ${projectIndex + 1} nie zawiera poprawnej listy pomiarów.`);
  }

  return {
    id: value.id,
    name: value.name,
    description: value.description,
    date: value.date,
    measurements: value.measurements.map((measurement, measurementIndex) =>
      validateMeasurement(measurement, projectIndex, measurementIndex),
    ),
  };
}

function assertUniqueIds(projects: Project[]): void {
  const projectIds = new Set<string>();

  for (const project of projects) {
    if (projectIds.has(project.id)) {
      throw new Error(`Plik zawiera zduplikowany identyfikator projektu: ${project.id}.`);
    }

    projectIds.add(project.id);

    const measurementIds = new Set<string>();
    for (const measurement of project.measurements) {
      if (measurementIds.has(measurement.id)) {
        throw new Error(`Projekt "${project.name}" zawiera zduplikowany identyfikator pomiaru: ${measurement.id}.`);
      }

      measurementIds.add(measurement.id);
    }
  }
}

export function serializeProjectsJson(projects: Project[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      projects,
      version: 1,
    },
    null,
    2,
  );
}

export function parseProjectsJson(rawValue: string): ParseProjectsJsonResult {
  try {
    const parsedValue = JSON.parse(rawValue) as unknown;
    const projectValues = Array.isArray(parsedValue)
      ? parsedValue
      : isRecord(parsedValue) && Array.isArray(parsedValue.projects)
        ? parsedValue.projects
        : null;

    if (!projectValues) {
      return {
        ok: false,
        error: "Plik JSON musi zawierać tablicę projektów albo obiekt z polem projects.",
      };
    }

    const projects = projectValues.map((project, projectIndex) =>
      validateProject(project, projectIndex),
    );
    assertUniqueIds(projects);

    return { ok: true, projects };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nie udało się odczytać pliku JSON.",
    };
  }
}
