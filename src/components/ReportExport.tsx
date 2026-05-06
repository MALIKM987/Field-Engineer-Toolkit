import { useState } from "react";
import { Download } from "lucide-react";
import type { Project } from "../types";
import { useI18n } from "../i18n";
import { exportProjectReport } from "../lib/reports/projectReport";

interface ReportExportProps {
  project: Project;
}

export function ReportExport({ project }: ReportExportProps) {
  const { t } = useI18n();
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    try {
      await exportProjectReport(project);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button className="secondary-button w-full sm:w-auto" disabled={isExporting} onClick={handleExport}>
      <Download size={18} aria-hidden="true" />
      {isExporting ? t("reportGenerating") : t("reportExportPdf")}
    </button>
  );
}
