import { Encoding } from "@capacitor/filesystem";
import { describe, expect, it } from "vitest";
import { arrayBufferToBase64, normalizeBase64Data } from "./base64";
import { createExportBlob } from "./blob";
import {
  exportCachePath,
  getExportKind,
  prepareNativeFilePayload,
  sanitizeFileName,
} from "./exportFile";
import { projectReportFileName } from "../reports/projectReport";

describe("file export helpers", () => {
  it("sanitizes generated file names", () => {
    expect(sanitizeFileName(" raport / projekt:test?.pdf ")).toBe("raport-projekt-test.pdf");
    expect(exportCachePath(" raport / projekt:test?.pdf ")).toBe("exports/raport-projekt-test.pdf");
    expect(projectReportFileName("Projekt / Test 01")).toBe(
      "field-engineer-toolkit-projekt-test-01-report.pdf",
    );
  });

  it("recognizes export types from file name and MIME type", () => {
    expect(getExportKind("report.pdf", "application/octet-stream")).toBe("pdf");
    expect(getExportKind("backup.txt", "application/json;charset=utf-8")).toBe("json");
    expect(getExportKind("data.csv", "text/csv")).toBe("other");
  });

  it("prepares text JSON data for web and native export", async () => {
    const json = JSON.stringify({ projects: [] });
    const blob = createExportBlob({
      data: json,
      dataEncoding: "text",
      mimeType: "application/json;charset=utf-8",
    });
    const nativePayload = prepareNativeFilePayload(json, "text");

    expect(blob.type).toBe("application/json;charset=utf-8");
    expect(await blob.text()).toBe(json);
    expect(nativePayload).toEqual({ data: json, encoding: Encoding.UTF8 });
  });

  it("prepares base64 PDF data for web and native export", async () => {
    const base64Pdf = arrayBufferToBase64(new Uint8Array([37, 80, 68, 70]).buffer);
    const dataUrl = `data:application/pdf;base64,${base64Pdf}`;
    const blob = createExportBlob({
      data: dataUrl,
      dataEncoding: "base64",
      mimeType: "application/pdf",
    });
    const nativePayload = prepareNativeFilePayload(dataUrl, "base64");

    expect(normalizeBase64Data(dataUrl)).toBe(base64Pdf);
    expect(blob.type).toBe("application/pdf");
    expect([...new Uint8Array(await blob.arrayBuffer())]).toEqual([37, 80, 68, 70]);
    expect(nativePayload).toEqual({ data: base64Pdf });
  });
});
