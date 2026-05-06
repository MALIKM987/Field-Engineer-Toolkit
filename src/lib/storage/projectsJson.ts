import type { Measurement, Project } from "../../types";

type ParseProjectsJsonResult =
  | { ok: true; projects: Project[] }
  | { ok: false; error: string };

export interface ProjectsJsonExport {
  content: string;
  fileName: string;
  mimeType: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDate(value: string): boolean {
  return Number.isFinite(new Date(value).getTime());
}

function assertNonBlankString(value: string, message: string): void {
  if (!value.trim()) {
    throw new Error(message);
  }
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

  assertNonBlankString(
    value.id,
    `Pomiar ${measurementIndex + 1} w projekcie ${projectIndex + 1} ma pusty identyfikator.`,
  );
  assertNonBlankString(
    value.name,
    `Pomiar ${measurementIndex + 1} w projekcie ${projectIndex + 1} ma pustą nazwę.`,
  );
  assertNonBlankString(
    value.unit,
    `Pomiar ${measurementIndex + 1} w projekcie ${projectIndex + 1} ma pustą jednostkę.`,
  );

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

  assertNonBlankString(value.id, `Projekt ${projectIndex + 1} ma pusty identyfikator.`);
  assertNonBlankString(value.name, `Projekt ${projectIndex + 1} ma pustą nazwę.`);

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
        throw new Error(
          `Projekt "${project.name}" zawiera zduplikowany identyfikator pomiaru: ${measurement.id}.`,
        );
      }

      measurementIds.add(measurement.id);
    }
  }
}

export function parseProjectsPayload(value: unknown): ParseProjectsJsonResult {
  try {
    const projectValues = Array.isArray(value)
      ? value
      : isRecord(value) && Array.isArray(value.projects)
        ? value.projects
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
      error: error instanceof Error ? error.message : "Nie udało się odczytać danych projektów.",
    };
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

export function createProjectsJsonExport(projects: Project[]): ProjectsJsonExport {
  return {
    content: serializeProjectsJson(projects),
    fileName: `field-engineer-toolkit-projects-${new Date().toISOString().slice(0, 10)}.json`,
    mimeType: "application/json;charset=utf-8",
  };
}

export function parseProjectsJson(rawValue: string): ParseProjectsJsonResult {
  try {
    return parseProjectsPayload(JSON.parse(rawValue) as unknown);
  } catch {
    return {
      ok: false,
      error: "Nie udało się odczytać pliku JSON.",
    };
  }
}

export function parseStoredProjects(rawValue: string | null): Project[] {
  if (!rawValue) {
    return [];
  }

  const result = parseProjectsJson(rawValue);
  return result.ok ? result.projects : [];
}
