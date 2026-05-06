import { ArrowLeft, CalendarDays, ClipboardList } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { MeasurementForm } from "../components/MeasurementForm";
import { MeasurementTable } from "../components/MeasurementTable";
import { ReportExport } from "../components/ReportExport";
import type { MeasurementFormData, Project } from "../types";
import { formatDate } from "../utils/date";

interface ProjectDetailsScreenProps {
  projects: Project[];
  onAddMeasurement: (projectId: string, data: MeasurementFormData) => void;
}

export function ProjectDetailsScreen({ projects, onAddMeasurement }: ProjectDetailsScreenProps) {
  const { projectId } = useParams();
  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    return (
      <div className="space-y-4">
        <Link className="secondary-button w-full sm:w-auto" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          Wróć do projektów
        </Link>
        <div className="panel">
          <h1 className="text-xl font-bold text-slate-950">Nie znaleziono projektu</h1>
          <p className="mt-2 text-sm text-slate-600">Projekt nie istnieje w lokalnym magazynie danych.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link className="secondary-button w-full sm:hidden" to="/">
        <ArrowLeft size={18} aria-hidden="true" />
        Projekty
      </Link>

      <section className="panel space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
              <ClipboardList size={18} aria-hidden="true" />
              Projekt pomiarowy
            </div>
            <h1 className="mt-2 break-words text-2xl font-bold text-slate-950">{project.name}</h1>
            {project.description ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {project.description}
              </p>
            ) : null}
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays size={17} aria-hidden="true" />
              {formatDate(project.date)}
            </div>
          </div>
          <ReportExport project={project} />
        </div>
      </section>

      <MeasurementForm onAddMeasurement={(data) => onAddMeasurement(project.id, data)} />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-950">Historia pomiarów</h2>
          <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
            {project.measurements.length}
          </span>
        </div>
        <MeasurementTable measurements={project.measurements} />
      </section>
    </div>
  );
}
