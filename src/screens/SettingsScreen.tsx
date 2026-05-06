import { Database, HardDrive, Smartphone } from "lucide-react";
import { DataImportExport } from "../components/DataImportExport";
import { languageOptions, useI18n } from "../i18n";
import { useTheme, type ThemeMode } from "../theme";
import type { Project } from "../types";

interface SettingsScreenProps {
  projects: Project[];
  onImportProjects: (projects: Project[]) => void;
}

export function SettingsScreen({ projects, onImportProjects }: SettingsScreenProps) {
  const { language, setLanguage, t } = useI18n();
  const { themeMode, setThemeMode } = useTheme();
  const themeOptions: Array<{ label: string; value: ThemeMode }> = [
    { label: t("themeLight"), value: "light" },
    { label: t("themeDark"), value: "dark" },
    { label: t("themeSystem"), value: "system" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">{t("settingsTitle")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("settingsLead")}</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="panel space-y-3">
          <div>
            <h2 className="font-bold text-slate-950">{t("settingsLanguage")}</h2>
            <p className="mt-1 text-sm text-slate-600">{t("settingsLanguageLead")}</p>
          </div>
          <select
            className="field-input"
            value={language}
            onChange={(event) => setLanguage(event.target.value as typeof language)}
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="panel space-y-3">
          <div>
            <h2 className="font-bold text-slate-950">{t("settingsAppearance")}</h2>
            <p className="mt-1 text-sm text-slate-600">{t("settingsAppearanceLead")}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                className={themeMode === option.value ? "primary-button px-2" : "secondary-button px-2"}
                key={option.value}
                onClick={() => setThemeMode(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <DataImportExport projects={projects} onImportProjects={onImportProjects} />

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="panel">
          <div className="flex items-center gap-3">
            <Database className="text-teal-700" size={22} aria-hidden="true" />
            <div>
              <h2 className="font-bold text-slate-950">{t("settingsStorage")}</h2>
              <p className="mt-1 text-sm text-slate-600">localStorage</p>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="flex items-center gap-3">
            <HardDrive className="text-teal-700" size={22} aria-hidden="true" />
            <div>
              <h2 className="font-bold text-slate-950">{t("settingsMode")}</h2>
              <p className="mt-1 text-sm text-slate-600">Web MVP</p>
            </div>
          </div>
        </div>

        <div className="panel sm:col-span-2">
          <div className="flex items-center gap-3">
            <Smartphone className="text-teal-700" size={22} aria-hidden="true" />
            <div>
              <h2 className="font-bold text-slate-950">{t("settingsNextStages")}</h2>
              <p className="mt-1 text-sm text-slate-600">PWA, Capacitor, Android APK/AAB</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
