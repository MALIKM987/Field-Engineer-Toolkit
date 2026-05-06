import type { Project } from "../../types";
import { formatDate, formatDateTime } from "../../utils/date";
import { arrayBufferToBase64 } from "../files/base64";

export interface ProjectReportLabels {
  comment: string;
  dateAndTime: string;
  description: string;
  measurementCount: string;
  name: string;
  noDescription: string;
  projectDate: string;
  projectReport: string;
  unit: string;
  value: string;
}

export interface ProjectReportExport {
  data: string;
  dataEncoding: "base64";
  fileName: string;
  mimeType: string;
}

export function projectReportFileName(projectName: string): string {
  const normalizedName = projectName
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");

  return `field-engineer-toolkit-${normalizedName || "project"}-report.pdf`;
}

export async function createProjectReportExport(
  project: Project,
  labels: ProjectReportLabels,
  locale: string,
): Promise<ProjectReportExport> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Field Engineer Toolkit", 14, 18);

  doc.setFontSize(13);
  doc.text(`${labels.projectReport}: ${project.name}`, 14, 30);

  doc.setFontSize(10);
  doc.text(`${labels.projectDate}: ${formatDate(project.date, locale)}`, 14, 40);
  doc.text(`${labels.measurementCount}: ${project.measurements.length}`, 14, 46);

  const description = project.description.trim() || labels.noDescription;
  const splitDescription = doc.splitTextToSize(`${labels.description}: ${description}`, 180);
  doc.text(splitDescription, 14, 56);

  autoTable(doc, {
    body: project.measurements.map((measurement) => [
      measurement.name,
      String(measurement.value),
      measurement.unit,
      measurement.comment || "-",
      formatDateTime(measurement.timestamp, locale),
    ]),
    head: [[labels.name, labels.value, labels.unit, labels.comment, labels.dateAndTime]],
    headStyles: { fillColor: [15, 118, 110] },
    startY: 68,
    styles: { cellPadding: 2, fontSize: 8 },
  });

  return {
    data: arrayBufferToBase64(doc.output("arraybuffer")),
    dataEncoding: "base64",
    fileName: projectReportFileName(project.name),
    mimeType: "application/pdf",
  };
}
