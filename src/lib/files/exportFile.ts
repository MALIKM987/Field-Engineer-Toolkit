import { Directory, Encoding, Filesystem, type WriteFileOptions } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { normalizeBase64Data } from "./base64";
import { createExportBlob, downloadBlob, type ExportDataEncoding } from "./blob";
import { getExportPlatform, type ExportPlatform } from "./platform";

export type ExportKind = "json" | "other" | "pdf";
export type ExportFileErrorCode =
  | "export-unavailable"
  | "share-failed"
  | "share-unavailable"
  | "write-failed";

export interface ExportFileOptions {
  data: string;
  dataEncoding: ExportDataEncoding;
  dialogTitle?: string;
  fileName: string;
  mimeType: string;
  shareTitle?: string;
}

export interface ExportFileResult {
  fileName: string;
  platform: ExportPlatform;
  uri?: string;
}

export interface NativeFilePayload {
  data: string;
  encoding?: Encoding;
}

export class ExportFileError extends Error {
  cause?: unknown;
  code: ExportFileErrorCode;

  constructor(code: ExportFileErrorCode, message: string, cause?: unknown) {
    super(message);
    this.code = code;
    this.cause = cause;
    this.name = "ExportFileError";
  }
}

export function sanitizeFileName(fileName: string): string {
  const sanitized = fileName
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-+(\.[a-z0-9]+)$/i, "$1")
    .replace(/^-|-$/g, "");

  return sanitized || "field-engineer-toolkit-export";
}

export function getExportKind(fileName: string, mimeType: string): ExportKind {
  const normalizedFileName = fileName.toLowerCase();
  const normalizedMimeType = mimeType.toLowerCase();

  if (normalizedMimeType.includes("pdf") || normalizedFileName.endsWith(".pdf")) {
    return "pdf";
  }

  if (normalizedMimeType.includes("json") || normalizedFileName.endsWith(".json")) {
    return "json";
  }

  return "other";
}

export function prepareNativeFilePayload(
  data: string,
  dataEncoding: ExportDataEncoding,
): NativeFilePayload {
  if (dataEncoding === "text") {
    return { data, encoding: Encoding.UTF8 };
  }

  return { data: normalizeBase64Data(data) };
}

async function exportNativeFile(options: ExportFileOptions, fileName: string): Promise<ExportFileResult> {
  let canShare = false;

  try {
    canShare = (await Share.canShare()).value;
  } catch (error) {
    throw new ExportFileError("share-unavailable", "Native share availability check failed.", error);
  }

  if (!canShare) {
    throw new ExportFileError("share-unavailable", "Native share is unavailable.");
  }

  const payload = prepareNativeFilePayload(options.data, options.dataEncoding);
  let uri: string;

  try {
    const writeOptions: WriteFileOptions = {
      data: payload.data,
      directory: Directory.Cache,
      path: `exports/${fileName}`,
      recursive: true,
    };

    if (payload.encoding) {
      writeOptions.encoding = payload.encoding;
    }

    const writeResult = await Filesystem.writeFile(writeOptions);
    uri = writeResult.uri;
  } catch (error) {
    throw new ExportFileError("write-failed", "Native file write failed.", error);
  }

  try {
    await Share.share({
      dialogTitle: options.dialogTitle,
      files: [uri],
      title: options.shareTitle,
    });
  } catch (error) {
    throw new ExportFileError("share-failed", "Native file share failed.", error);
  }

  return { fileName, platform: "native", uri };
}

export async function exportFile(options: ExportFileOptions): Promise<ExportFileResult> {
  const fileName = sanitizeFileName(options.fileName);
  const platform = getExportPlatform();

  if (platform === "native") {
    return exportNativeFile(options, fileName);
  }

  try {
    const blob = createExportBlob({
      data: options.data,
      dataEncoding: options.dataEncoding,
      mimeType: options.mimeType,
    });
    downloadBlob(blob, fileName);
  } catch (error) {
    throw new ExportFileError("export-unavailable", "Web file export failed.", error);
  }

  return { fileName, platform: "web" };
}
