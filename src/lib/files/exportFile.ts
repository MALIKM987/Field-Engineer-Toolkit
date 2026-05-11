import { Directory, Encoding, Filesystem, type WriteFileOptions } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { normalizeBase64Data } from "./base64";
import { createExportBlob, downloadBlob, type ExportDataEncoding } from "./blob";
import { getExportPlatform, type ExportPlatform } from "./platform";

export type ExportFileAction = "save" | "share";
export type ExportKind = "json" | "other" | "pdf";
export type ExportFileErrorCode =
  | "export-unavailable"
  | "share-failed"
  | "share-unavailable"
  | "write-failed";

export interface ExportFileOptions {
  action?: ExportFileAction;
  data: string;
  dataEncoding: ExportDataEncoding;
  dialogTitle?: string;
  fileName: string;
  mimeType: string;
  shareTitle?: string;
}

export interface ExportFileResult {
  action: ExportFileAction;
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

export function exportCachePath(fileName: string): string {
  return `exports/${sanitizeFileName(fileName)}`;
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

async function writeNativeCacheFile(
  options: ExportFileOptions,
  fileName: string,
): Promise<{ path: string; uri: string }> {
  const path = exportCachePath(fileName);
  const payload = prepareNativeFilePayload(options.data, options.dataEncoding);

  try {
    const writeOptions: WriteFileOptions = {
      data: payload.data,
      directory: Directory.Cache,
      path,
      recursive: true,
    };

    if (payload.encoding) {
      writeOptions.encoding = payload.encoding;
    }

    await Filesystem.writeFile(writeOptions);
    const uriResult = await Filesystem.getUri({
      directory: Directory.Cache,
      path,
    });

    return { path, uri: uriResult.uri };
  } catch (error) {
    throw new ExportFileError("write-failed", "Native file write failed.", error);
  }
}

async function ensureNativeShareAvailable(): Promise<void> {
  let canShare = false;

  try {
    canShare = (await Share.canShare()).value;
  } catch (error) {
    throw new ExportFileError("share-unavailable", "Native share availability check failed.", error);
  }

  if (!canShare) {
    throw new ExportFileError("share-unavailable", "Native share is unavailable.");
  }
}

async function exportNativeFile(
  options: ExportFileOptions,
  fileName: string,
  action: ExportFileAction,
): Promise<ExportFileResult> {
  if (action === "share") {
    await ensureNativeShareAvailable();
  }

  const { uri } = await writeNativeCacheFile(options, fileName);

  if (action === "share") {
    try {
      await Share.share({
        dialogTitle: options.dialogTitle,
        files: [uri],
        title: options.shareTitle,
      });
    } catch (error) {
      throw new ExportFileError("share-failed", "Native file share failed.", error);
    }
  }

  return { action, fileName, platform: "native", uri };
}

async function shareWebFile(options: ExportFileOptions, fileName: string): Promise<void> {
  const blob = createExportBlob({
    data: options.data,
    dataEncoding: options.dataEncoding,
    mimeType: options.mimeType,
  });
  const file = new File([blob], fileName, { type: options.mimeType });
  const shareData: ShareData = {
    files: [file],
    title: options.shareTitle,
  };
  const navigatorWithShare = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (!navigatorWithShare.share || !navigatorWithShare.canShare?.(shareData)) {
    throw new ExportFileError("share-unavailable", "Web file sharing is unavailable.");
  }

  try {
    await navigatorWithShare.share(shareData);
  } catch (error) {
    throw new ExportFileError("share-failed", "Web file share failed.", error);
  }
}

export async function exportFile(options: ExportFileOptions): Promise<ExportFileResult> {
  const action = options.action ?? "save";
  const fileName = sanitizeFileName(options.fileName);
  const platform = getExportPlatform();

  if (platform === "native") {
    return exportNativeFile(options, fileName, action);
  }

  try {
    if (action === "share") {
      await shareWebFile(options, fileName);
      return { action, fileName, platform: "web" };
    }

    const blob = createExportBlob({
      data: options.data,
      dataEncoding: options.dataEncoding,
      mimeType: options.mimeType,
    });
    downloadBlob(blob, fileName);
  } catch (error) {
    if (error instanceof ExportFileError) {
      throw error;
    }

    throw new ExportFileError("export-unavailable", "Web file export failed.", error);
  }

  return { action, fileName, platform: "web" };
}
