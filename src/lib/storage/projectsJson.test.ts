import { describe, expect, it } from "vitest";
import type { Measurement, Project } from "../../types";
import {
  createProjectsJsonExport,
  parseProjectsJson,
  parseStoredProjects,
} from "./projectsJson";

const measurement = (overrides: Partial<Measurement> = {}): Measurement => ({
  id: "measurement-1",
  name: "Napięcie wejściowe",
  value: 12.5,
  unit: "V",
  comment: "Pomiar referencyjny",
  timestamp: "2026-05-06T08:00:00.000Z",
  ...overrides,
});

const project = (overrides: Partial<Project> = {}): Project => ({
  id: "project-1",
  name: "Projekt testowy",
  description: "Zakres testowy",
  date: "2026-05-06",
  measurements: [measurement()],
  ...overrides,
});

describe("projects JSON import and export", () => {
  it("imports an object with version, exportedAt and projects", () => {
    const result = parseProjectsJson(
      JSON.stringify({
        exportedAt: "2026-05-06T10:00:00.000Z",
        projects: [project()],
        version: 1,
      }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].measurements).toHaveLength(1);
    }
  });

  it("imports a raw projects array", () => {
    const result = parseProjectsJson(JSON.stringify([project()]));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.projects[0].id).toBe("project-1");
    }
  });

  it("rejects a file without a projects array", () => {
    const result = parseProjectsJson(JSON.stringify({ version: 1, exportedAt: "2026-05-06" }));

    expect(result.ok).toBe(false);
  });

  it("rejects a project without required fields", () => {
    const result = parseProjectsJson(JSON.stringify({ projects: [{ id: "project-1" }] }));

    expect(result.ok).toBe(false);
  });

  it("rejects a measurement without required fields", () => {
    const result = parseProjectsJson(
      JSON.stringify({
        projects: [project({ measurements: [{ id: "measurement-1" } as Measurement] })],
      }),
    );

    expect(result.ok).toBe(false);
  });

  it("rejects an invalid project date", () => {
    const result = parseProjectsJson(JSON.stringify({ projects: [project({ date: "bad-date" })] }));

    expect(result.ok).toBe(false);
  });

  it("rejects an invalid measurement date", () => {
    const result = parseProjectsJson(
      JSON.stringify({
        projects: [project({ measurements: [measurement({ timestamp: "bad-date" })] })],
      }),
    );

    expect(result.ok).toBe(false);
  });

  it("rejects a measurement value that is not a number", () => {
    const invalidMeasurement = {
      ...measurement(),
      value: "12.5",
    };
    const result = parseProjectsJson(
      JSON.stringify({ projects: [project({ measurements: [invalidMeasurement as unknown as Measurement] })] }),
    );

    expect(result.ok).toBe(false);
  });

  it("rejects duplicate project IDs", () => {
    const result = parseProjectsJson(
      JSON.stringify({ projects: [project(), project({ name: "Drugi projekt" })] }),
    );

    expect(result.ok).toBe(false);
  });

  it("rejects duplicate measurement IDs inside one project", () => {
    const result = parseProjectsJson(
      JSON.stringify({
        projects: [
          project({
            measurements: [measurement(), measurement({ name: "Drugi pomiar" })],
          }),
        ],
      }),
    );

    expect(result.ok).toBe(false);
  });

  it("returns an empty project list for corrupted localStorage data", () => {
    expect(parseStoredProjects("{not-json")).toEqual([]);
    expect(parseStoredProjects(JSON.stringify({ projects: [{ id: "broken" }] }))).toEqual([]);
  });

  it("creates a JSON export payload", () => {
    const exportData = createProjectsJsonExport([project()]);
    const parsedExport = parseProjectsJson(exportData.content);

    expect(exportData.fileName).toMatch(/^field-engineer-toolkit-projects-\d{4}-\d{2}-\d{2}\.json$/);
    expect(exportData.mimeType).toBe("application/json;charset=utf-8");
    expect(parsedExport.ok).toBe(true);
  });
});
