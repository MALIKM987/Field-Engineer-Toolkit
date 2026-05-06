import { Info } from "lucide-react";
import { DataImportExport } from "../components/DataImportExport";
import { APP_NAME, APP_PLATFORMS, APP_VERSION } from "../config/appInfo";
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

      <section className="panel">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
            <Info size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-950">{t("aboutApp")}</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-700">{t("projectName")}</dt>
                <dd className="mt-1 text-slate-600">{APP_NAME}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">{t("appVersion")}</dt>
                <dd className="mt-1 text-slate-600">{APP_VERSION}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-700">{t("platformInfo")}</dt>
                <dd className="mt-1 text-slate-600">{APP_PLATFORMS}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-slate-600">{t("localDataInfo")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
