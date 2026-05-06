import { CalculatorPanel } from "../components/CalculatorPanel";

export function CalculatorsScreen() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Kalkulatory</h1>
        <p className="mt-1 text-sm text-slate-600">Szybkie obliczenia elektryczne i sygnałowe.</p>
      </div>
      <CalculatorPanel />
    </div>
  );
}
