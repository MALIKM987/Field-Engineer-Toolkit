import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import type { Project } from "../types";
import { languageLocales, useI18n } from "../i18n";
import {
  ExportFileError,
  exportFile,
  type ExportFileAction,
  type ExportFileResult,
} from "../lib/files/exportFile";
import { createProjectReportExport } from "../lib/reports/projectReport";

interface ReportExportProps {
  project: Project;
}

export function ReportExport({ project }: ReportExportProps) {
  const { language, t } = useI18n();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exportingAction, setExportingAction] = useState<ExportFileAction | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function resolveExportError(error: unknown): string {
    if (error instanceof ExportFileError) {
      if (error.code === "share-unavailable") {
        return t("nativeShareUnavailable");
      }

      if (error.code === "export-unavailable") {
        return t("exportUnavailable");
      }
    }

    return t("pdfExportError");
  }

  function resolveSuccessMessage(result: ExportFileResult): string {
    if (result.action === "share") {
      return t("fileSavedAndShared");
    }

    return result.platform === "native" ? t("fileSavedInAppCache") : t("fileDownloadStarted");
  }

  async function handleExport(action: ExportFileAction) {
    setExportingAction(action);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const report = await createProjectReportExport(
        project,
        {
          comment: t("measurementComment"),
          dateAndTime: t("measurementTimestamp"),
          description: t("projectDescription"),
          measurementCount: t("reportMeasurementCount"),
          name: t("measurementName"),
          noDescription: t("reportNoDescription"),
          projectDate: t("reportProjectDate"),
          projectReport: t("reportProject"),
          unit: t("measurementUnit"),
          value: t("measurementValue"),
        },
        languageLocales[language],
      );
      const result = await exportFile({
        action,
        ...report,
        dialogTitle: t("shareDialogTitle"),
        shareTitle: t("sharePdfTitle"),
      });
      setSuccessMessage(resolveSuccessMessage(result));
    } catch (error) {
      setErrorMessage(resolveExportError(error));
    } finally {
      setExportingAction(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          className="secondary-button w-full sm:w-auto"
          disabled={Boolean(exportingAction)}
          onClick={() => handleExport("save")}
          type="button"
        >
          <Download size={18} aria-hidden="true" />
          {exportingAction === "save" ? t("reportGenerating") : t("saveFile")}
        </button>
        <button
          className="primary-button w-full sm:w-auto"
          disabled={Boolean(exportingAction)}
          onClick={() => handleExport("share")}
          type="button"
        >
          <Share2 size={18} aria-hidden="true" />
          {exportingAction === "share" ? t("reportGenerating") : t("shareFile")}
        </button>
      </div>
      {successMessage ? <p className="text-sm text-teal-700 dark:text-teal-300">{successMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p> : null}
    </div>
  );
}
