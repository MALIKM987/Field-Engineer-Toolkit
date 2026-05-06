import { ClipboardList, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "../types";
import { formatDate } from "../utils/date";

interface ProjectListProps {
  projects: Project[];
  activeProjectId?: string;
}

export function ProjectList({ projects, activeProjectId }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-600">
        Brak projektów pomiarowych.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => {
        const active = project.id === activeProjectId;

        return (
          <Link
            className={`block rounded-lg border bg-white p-4 shadow-sm transition active:scale-[0.99] ${
              active ? "border-teal-700 ring-2 ring-teal-700/15" : "border-slate-200"
            }`}
            key={project.id}
            to={`/projects/${project.id}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                  active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                <ClipboardList size={20} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-base font-bold text-slate-950">{project.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{formatDate(project.date)}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {project.measurements.length} pomiarów
                </p>
              </div>
              <ChevronRight className="mt-2 shrink-0 text-slate-400" size={18} aria-hidden="true" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
