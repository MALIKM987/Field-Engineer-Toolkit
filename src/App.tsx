import { Calculator, ClipboardList, Settings, Wrench } from "lucide-react";
import { NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ProjectList } from "./components/ProjectList";
import { PROJECTS_STORAGE_KEY, upsertProject } from "./lib/storage/projectsStorage";
import { parseStoredProjects } from "./lib/storage/projectsJson";
import { CalculatorsScreen } from "./screens/CalculatorsScreen";
import { ProjectDetailsScreen } from "./screens/ProjectDetailsScreen";
import { ProjectsScreen } from "./screens/ProjectsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { MeasurementFormData, Project, ProjectFormData } from "./types";
import { dateTimeLocalToIso } from "./utils/date";
import { createId } from "./utils/id";
import { parseDecimal } from "./utils/numbers";

const navItems = [
  { to: "/", label: "Projekty", icon: ClipboardList },
  { to: "/calculators", label: "Kalkulatory", icon: Calculator },
  { to: "/settings", label: "Ustawienia", icon: Settings },
];

function isProjectRoute(pathname: string) {
  return pathname === "/" || pathname.startsWith("/projects/");
}

export default function App() {
  const [projects, setProjects] = useLocalStorage<Project[]>(
    PROJECTS_STORAGE_KEY,
    [],
    parseStoredProjects,
  );
  const navigate = useNavigate();
  const location = useLocation();
  const activeProjectId = location.pathname.startsWith("/projects/")
    ? location.pathname.split("/")[2]
    : undefined;

  function handleCreateProject(data: ProjectFormData) {
    const project: Project = {
      id: createId("project"),
      name: data.name,
      description: data.description,
      date: data.date,
      measurements: [],
    };

    setProjects((currentProjects) => upsertProject(currentProjects, project));
    navigate(`/projects/${project.id}`);
  }

  function handleUpdateProject(projectId: string, data: ProjectFormData) {
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              name: data.name,
              description: data.description,
              date: data.date,
            }
          : project,
      ),
    );
  }

  function handleDeleteProject(projectId: string) {
    setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));

    if (activeProjectId === projectId) {
      navigate("/");
    }
  }

  function handleImportProjects(importedProjects: Project[]) {
    setProjects(importedProjects);
    navigate("/");
  }

  function handleAddMeasurement(projectId: string, data: MeasurementFormData) {
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        return {
          ...project,
          measurements: [
            {
              id: createId("measurement"),
              name: data.name,
              value: parseDecimal(data.value),
              unit: data.unit,
              comment: data.comment,
              timestamp: dateTimeLocalToIso(data.timestamp),
            },
            ...project.measurements,
          ],
        };
      }),
    );
  }

  function handleUpdateMeasurement(
    projectId: string,
    measurementId: string,
    data: MeasurementFormData,
  ) {
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        return {
          ...project,
          measurements: project.measurements.map((measurement) =>
            measurement.id === measurementId
              ? {
                  ...measurement,
                  name: data.name,
                  value: parseDecimal(data.value),
                  unit: data.unit,
                  comment: data.comment,
                  timestamp: dateTimeLocalToIso(data.timestamp),
                }
              : measurement,
          ),
        };
      }),
    );
  }

  function handleDeleteMeasurement(projectId: string, measurementId: string) {
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        return {
          ...project,
          measurements: project.measurements.filter(
            (measurement) => measurement.id !== measurementId,
          ),
        };
      }),
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f4] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-700 text-white">
            <Wrench size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-teal-700">Field Engineer Toolkit</p>
            <h1 className="truncate text-lg font-bold text-slate-950">MVP pomiarów i obliczeń</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-5 pb-28 sm:px-6 lg:pb-8">
        <aside className="hidden w-80 shrink-0 space-y-4 lg:block">
          <nav className="panel space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-bold ${
                      isActive || (item.to === "/" && isProjectRoute(location.pathname))
                        ? "bg-teal-700 text-white"
                        : "text-slate-700 active:bg-slate-100"
                    }`
                  }
                  end={item.to === "/"}
                  key={item.to}
                  to={item.to}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Projekty</h2>
            <ProjectList projects={projects} activeProjectId={activeProjectId} />
          </section>
        </aside>

        <main className="min-w-0 flex-1">
          <Routes>
            <Route
              element={<ProjectsScreen projects={projects} onCreateProject={handleCreateProject} />}
              path="/"
            />
            <Route
              element={
                <ProjectDetailsScreen
                  projects={projects}
                  onAddMeasurement={handleAddMeasurement}
                  onDeleteMeasurement={handleDeleteMeasurement}
                  onDeleteProject={handleDeleteProject}
                  onUpdateMeasurement={handleUpdateMeasurement}
                  onUpdateProject={handleUpdateProject}
                />
              }
              path="/projects/:projectId"
            />
            <Route element={<CalculatorsScreen />} path="/calculators" />
            <Route
              element={
                <SettingsScreen projects={projects} onImportProjects={handleImportProjects} />
              }
              path="/settings"
            />
          </Routes>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white lg:hidden">
        <div className="grid grid-cols-3 px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-bold ${
                    isActive || (item.to === "/" && isProjectRoute(location.pathname))
                      ? "text-teal-700"
                      : "text-slate-500"
                  }`
                }
                end={item.to === "/"}
                key={item.to}
                to={item.to}
              >
                <Icon size={22} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
