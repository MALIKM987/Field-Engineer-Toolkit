import type { Project } from "../../types";

export const PROJECTS_STORAGE_KEY = "field-engineer-toolkit.projects";

export function getProjects(): Project[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    return rawValue ? (JSON.parse(rawValue) as Project[]) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function upsertProject(projects: Project[], project: Project): Project[] {
  const exists = projects.some((item) => item.id === project.id);

  if (!exists) {
    return [project, ...projects];
  }

  return projects.map((item) => (item.id === project.id ? project : item));
}
