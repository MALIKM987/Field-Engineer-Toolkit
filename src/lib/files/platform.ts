import { Capacitor } from "@capacitor/core";

export type ExportPlatform = "native" | "web";

export function getExportPlatform(): ExportPlatform {
  return Capacitor.isNativePlatform() ? "native" : "web";
}
