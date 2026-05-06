import { CalculatorPanel } from "../components/CalculatorPanel";
import { useI18n } from "../i18n";

export function CalculatorsScreen() {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">{t("calcTitle")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("calcLead")}</p>
      </div>
      <CalculatorPanel />
    </div>
  );
}
