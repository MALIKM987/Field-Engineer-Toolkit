import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, ClipboardList, Edit3, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { MeasurementForm } from "../components/MeasurementForm";
import { MeasurementTable } from "../components/MeasurementTable";
import { ProjectForm } from "../components/ProjectForm";
import { ReportExport } from "../components/ReportExport";
import { useI18n } from "../i18n";
import type { Measurement, MeasurementFormData, Project, ProjectFormData } from "../types";
import { dateTimeInputValue, formatDate } from "../utils/date";

interface ProjectDetailsScreenProps {
  projects: Project[];
  onAddMeasurement: (projectId: string, data: MeasurementFormData) => void;
  onDeleteMeasurement: (projectId: string, measurementId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateMeasurement: (
    projectId: string,
    measurementId: string,
    data: MeasurementFormData,
  ) => void;
  onUpdateProject: (projectId: string, data: ProjectFormData) => void;
}

type PendingDelete =
  | { type: "project"; project: Project }
  | { type: "measurement"; measurement: Measurement };

export function ProjectDetailsScreen({
  projects,
  onAddMeasurement,
  onDeleteMeasurement,
  onDeleteProject,
  onUpdateMeasurement,
  onUpdateProject,
}: ProjectDetailsScreenProps) {
  const { t } = useI18n();
  const { projectId } = useParams();
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingMeasurementId, setEditingMeasurementId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const project = projects.find((item) => item.id === projectId);

  const editingMeasurement = useMemo(
    () => project?.measurements.find((measurement) => measurement.id === editingMeasurementId),
    [editingMeasurementId, project?.measurements],
  );

  const editingMeasurementData = editingMeasurement
    ? {
        name: editingMeasurement.name,
        value: String(editingMeasurement.value),
        unit: editingMeasurement.unit,
        comment: editingMeasurement.comment,
        timestamp: dateTimeInputValue(new Date(editingMeasurement.timestamp)),
      }
    : undefined;

  function handleConfirmDelete() {
    if (!pendingDelete || !project) {
      return;
    }

    if (pendingDelete.type === "project") {
      onDeleteProject(pendingDelete.project.id);
      setPendingDelete(null);
      return;
    }

    if (editingMeasurementId === pendingDelete.measurement.id) {
      setEditingMeasurementId(null);
    }

    onDeleteMeasurement(project.id, pendingDelete.measurement.id);
    setPendingDelete(null);
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link className="secondary-button w-full sm:w-auto" to="/">
          <ArrowLeft size={18} aria-hidden="true" />
          {t("commonBackToProjects")}
        </Link>
        <div className="panel">
          <h1 className="text-xl font-bold text-slate-950">{t("projectNotFound")}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {t("projectNotFoundBody")}
          </p>
        </div>
      </div>
    );
  }

  const dialogTitle =
    pendingDelete?.type === "project" ? t("projectDeleteTitle") : t("measurementDeleteTitle");
  const dialogDescription =
    pendingDelete?.type === "project"
      ? t("projectDeleteDescription", { name: pendingDelete.project.name })
      : pendingDelete
        ? t("measurementDeleteDescription", { name: pendingDelete.measurement.name })
        : "";

  return (
    <div className="space-y-5">
      <Link className="secondary-button w-full sm:hidden" to="/">
        <ArrowLeft size={18} aria-hidden="true" />
        {t("navProjects")}
      </Link>

      <section className="panel space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
              <ClipboardList size={18} aria-hidden="true" />
              {t("projectLabel")}
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
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <ReportExport project={project} />
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                className="secondary-button"
                onClick={() => setIsEditingProject((current) => !current)}
                type="button"
              >
                <Edit3 size={18} aria-hidden="true" />
                {t("commonEdit")}
              </button>
              <button
                className="danger-button"
                onClick={() => setPendingDelete({ type: "project", project })}
                type="button"
              >
                <Trash2 size={18} aria-hidden="true" />
                {t("commonDelete")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {isEditingProject ? (
        <ProjectForm
          initialData={{
            name: project.name,
            description: project.description,
            date: project.date,
          }}
          onCancel={() => setIsEditingProject(false)}
          onSubmit={(data) => {
            onUpdateProject(project.id, data);
            setIsEditingProject(false);
          }}
          submitLabel={t("projectSave")}
          title={t("projectEditTitle")}
        />
      ) : null}

      <MeasurementForm
        key={editingMeasurement?.id ?? "new-measurement"}
        initialData={editingMeasurementData}
        onCancel={editingMeasurement ? () => setEditingMeasurementId(null) : undefined}
        onSubmit={(data) => {
          if (editingMeasurement) {
            onUpdateMeasurement(project.id, editingMeasurement.id, data);
            setEditingMeasurementId(null);
            return;
          }

          onAddMeasurement(project.id, data);
        }}
        submitLabel={editingMeasurement ? t("measurementSave") : t("measurementAdd")}
        title={editingMeasurement ? t("measurementEditTitle") : t("measurementNewTitle")}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-950">{t("measurementHistory")}</h2>
          <span className="rounded-md bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">
            {project.measurements.length}
          </span>
        </div>
        <MeasurementTable
          editingMeasurementId={editingMeasurementId}
          measurements={project.measurements}
          onDeleteMeasurement={(measurement) =>
            setPendingDelete({ type: "measurement", measurement })
          }
          onEditMeasurement={(measurement) => setEditingMeasurementId(measurement.id)}
        />
      </section>

      {pendingDelete ? (
        <ConfirmDialog
          description={dialogDescription}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
          title={dialogTitle}
        />
      ) : null}
    </div>
  );
}
