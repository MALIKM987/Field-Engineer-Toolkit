import { base64ToBlob } from "./base64";

export type ExportDataEncoding = "base64" | "text";

export interface ExportBlobInput {
  data: string;
  dataEncoding: ExportDataEncoding;
  mimeType: string;
}

export function createExportBlob({ data, dataEncoding, mimeType }: ExportBlobInput): Blob {
  if (dataEncoding === "base64") {
    return base64ToBlob(data, mimeType);
  }

  return new Blob([data], { type: mimeType });
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
