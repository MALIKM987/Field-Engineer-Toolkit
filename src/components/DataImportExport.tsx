import { ChangeEvent, useRef, useState } from "react";
import { Download, Share2, Upload } from "lucide-react";
import type { Project } from "../types";
import { useI18n } from "../i18n";
import {
  ExportFileError,
  exportFile,
  type ExportFileAction,
  type ExportFileResult,
} from "../lib/files/exportFile";
import { createProjectsJsonExport, parseProjectsJson } from "../lib/storage/projectsJson";
import { ConfirmDialog } from "./ConfirmDialog";

interface DataImportExportProps {
  projects: Project[];
  onImportProjects: (projects: Project[]) => void;
}

export function DataImportExport({ projects, onImportProjects }: DataImportExportProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportingAction, setExportingAction] = useState<ExportFileAction | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [pendingProjects, setPendingProjects] = useState<Project[] | null>(null);

  function resolveExportError(error: unknown): string {
    if (error instanceof ExportFileError) {
      if (error.code === "share-unavailable") {
        return t("nativeShareUnavailable");
      }

      if (error.code === "export-unavailable") {
        return t("exportUnavailable");
      }
    }

    return t("jsonExportError");
  }

  function resolveSuccessMessage(result: ExportFileResult): string {
    if (result.action === "share") {
      return t("fileSavedAndShared");
    }

    return result.platform === "native" ? t("fileSavedInAppCache") : t("fileDownloadStarted");
  }

  async function handleExport(action: ExportFileAction) {
    setExportError(null);
    setExportMessage(null);
    setImportError(null);
    setImportMessage(null);
    setExportingAction(action);

    try {
      const exportData = createProjectsJsonExport(projects);
      const result = await exportFile({
        action,
        data: exportData.content,
        dataEncoding: "text",
        dialogTitle: t("shareDialogTitle"),
        fileName: exportData.fileName,
        mimeType: exportData.mimeType,
        shareTitle: t("shareJsonTitle"),
      });

      setExportMessage(resolveSuccessMessage(result));
    } catch (error) {
      setExportError(resolveExportError(error));
    } finally {
      setExportingAction(null);
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setImportError(null);
    setImportMessage(null);
    setExportError(null);
    setExportMessage(null);

    try {
      const rawValue = await file.text();
      const result = parseProjectsJson(rawValue);

      if (!result.ok) {
        setImportError(result.error);
        return;
      }

      setPendingProjects(result.projects);
    } catch {
      setImportError(t("dataImportReadError"));
    }
  }

  function confirmImport() {
    if (!pendingProjects) {
      return;
    }

    onImportProjects(pendingProjects);
    setImportMessage(t("dataImportSuccess", { count: pendingProjects.length }));
    setPendingProjects(null);
  }

  return (
    <section className="panel space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-950">{t("dataTitle")}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {t("dataLead")}
        </p>
      </div>

      {exportError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {exportError}
        </div>
      ) : null}

      {exportMessage ? (
        <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {exportMessage}
        </div>
      ) : null}

      {importError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {importError}
        </div>
      ) : null}

      {importMessage ? (
        <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {importMessage}
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          className="secondary-button w-full"
          disabled={Boolean(exportingAction)}
          onClick={() => handleExport("save")}
          type="button"
        >
          <Download size={18} aria-hidden="true" />
          {exportingAction === "save" ? t("reportGenerating") : t("saveFile")}
        </button>
        <button
          className="secondary-button w-full"
          disabled={Boolean(exportingAction)}
          onClick={() => handleExport("share")}
          type="button"
        >
          <Share2 size={18} aria-hidden="true" />
          {exportingAction === "share" ? t("reportGenerating") : t("shareFile")}
        </button>
        <button
          className="primary-button w-full"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Upload size={18} aria-hidden="true" />
          {t("dataImportJson")}
        </button>
      </div>

      <input
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
        ref={fileInputRef}
        type="file"
      />

      {pendingProjects ? (
        <ConfirmDialog
          confirmLabel={t("dataImportJson")}
          description={t("dataImportConfirmDescription", { count: pendingProjects.length })}
          onCancel={() => setPendingProjects(null)}
          onConfirm={confirmImport}
          title={t("dataImportConfirmTitle")}
        />
      ) : null}
    </section>
  );
}
