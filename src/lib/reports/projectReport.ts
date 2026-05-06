import type { Project } from "../../types";
import { formatDate, formatDateTime } from "../../utils/date";

function reportFileName(projectName: string): string {
  const normalizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9ąćęłńóśźż]+/gi, "-")
    .replace(/^-|-$/g, "");

  return `raport-${normalizedName || "projekt"}.pdf`;
}

export async function exportProjectReport(project: Project): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Field Engineer Toolkit", 14, 18);

  doc.setFontSize(13);
  doc.text(`Raport projektu: ${project.name}`, 14, 30);

  doc.setFontSize(10);
  doc.text(`Data projektu: ${formatDate(project.date)}`, 14, 40);
  doc.text(`Liczba pomiarów: ${project.measurements.length}`, 14, 46);

  const description = project.description.trim() || "Brak opisu";
  const splitDescription = doc.splitTextToSize(`Opis: ${description}`, 180);
  doc.text(splitDescription, 14, 56);

  autoTable(doc, {
    startY: 68,
    head: [["Nazwa", "Wartość", "Jednostka", "Komentarz", "Data i godzina"]],
    body: project.measurements.map((measurement) => [
      measurement.name,
      String(measurement.value),
      measurement.unit,
      measurement.comment || "-",
      formatDateTime(measurement.timestamp),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 118, 110] },
  });

  doc.save(reportFileName(project.name));
}
