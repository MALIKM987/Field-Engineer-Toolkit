import { ChangeEvent, useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import type { Project } from "../types";
import { createProjectsJsonExport, parseProjectsJson } from "../lib/storage/projectsJson";
import { ConfirmDialog } from "./ConfirmDialog";

interface DataImportExportProps {
  projects: Project[];
  onImportProjects: (projects: Project[]) => void;
}

export function DataImportExport({ projects, onImportProjects }: DataImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [pendingProjects, setPendingProjects] = useState<Project[] | null>(null);

  function handleExport() {
    const exportData = createProjectsJsonExport(projects);
    const blob = new Blob([exportData.content], { type: exportData.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportData.fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setImportError(null);
    setImportMessage(null);

    try {
      const rawValue = await file.text();
      const result = parseProjectsJson(rawValue);

      if (!result.ok) {
        setImportError(result.error);
        return;
      }

      setPendingProjects(result.projects);
    } catch {
      setImportError("Nie udało się odczytać wybranego pliku.");
    }
  }

  function confirmImport() {
    if (!pendingProjects) {
      return;
    }

    onImportProjects(pendingProjects);
    setImportMessage(`Zaimportowano ${pendingProjects.length} projektów.`);
    setPendingProjects(null);
  }

  return (
    <section className="panel space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-950">Import i eksport danych</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Zapisz wszystkie projekty do pliku JSON albo wczytaj wcześniej wyeksportowane dane.
        </p>
      </div>

      {importError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {importError}
        </div>
      ) : null}

      {importMessage ? (
        <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {importMessage}
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <button className="secondary-button w-full" onClick={handleExport} type="button">
          <Download size={18} aria-hidden="true" />
          Eksportuj JSON
        </button>
        <button
          className="primary-button w-full"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Upload size={18} aria-hidden="true" />
          Importuj JSON
        </button>
      </div>

      <input
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
        ref={fileInputRef}
        type="file"
      />

      {pendingProjects ? (
        <ConfirmDialog
          confirmLabel="Importuj"
          description={`Import zastąpi aktualne dane liczbą ${pendingProjects.length} projektów z pliku JSON. Tej operacji nie można cofnąć.`}
          onCancel={() => setPendingProjects(null)}
          onConfirm={confirmImport}
          title="Nadpisać dane?"
        />
      ) : null}
    </section>
  );
}
