import { useState } from "react";
import { Download } from "lucide-react";
import type { Project } from "../types";
import { languageLocales, useI18n } from "../i18n";
import { ExportFileError, exportFile } from "../lib/files/exportFile";
import { createProjectReportExport } from "../lib/reports/projectReport";

interface ReportExportProps {
  project: Project;
}

export function ReportExport({ project }: ReportExportProps) {
  const { language, t } = useI18n();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
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

  async function handleExport() {
    setIsExporting(true);
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
        ...report,
        dialogTitle: t("shareDialogTitle"),
        shareTitle: t("sharePdfTitle"),
      });
      setSuccessMessage(result.platform === "native" ? t("fileSavedAndShared") : t("exportSuccess"));
    } catch (error) {
      setErrorMessage(resolveExportError(error));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="secondary-button w-full sm:w-auto"
        disabled={isExporting}
        onClick={handleExport}
        type="button"
      >
        <Download size={18} aria-hidden="true" />
        {isExporting ? t("reportGenerating") : t("reportExportPdf")}
      </button>
      {successMessage ? <p className="text-sm text-teal-700">{successMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
    </div>
  );
}
