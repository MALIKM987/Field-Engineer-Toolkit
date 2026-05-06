import { useMemo, useState } from "react";
import {
  Activity,
  Divide,
  Gauge,
  RadioTower,
  Sigma,
  Waves,
  Zap,
} from "lucide-react";
import type {
  CalculatorId,
  CalculatorResult,
  FrequencyMode,
  OhmsLawTarget,
  PowerMode,
  VppMode,
} from "../types";
import {
  calculateFrequencyPeriod,
  calculateOhmsLaw,
  calculatePower,
  calculateRcCutoff,
  calculateVoltageDivider,
  calculateVppVrms,
} from "../lib/calculators/electrical";
import { formatEngineeringNumber, parseDecimal } from "../utils/numbers";
import {
  validateFiniteInputs,
  validateNonZeroInputs,
  validatePositiveInputs,
} from "../utils/validation";

const calculators: Array<{ id: CalculatorId; label: string; icon: typeof Zap }> = [
  { id: "ohm", label: "Ohm", icon: Zap },
  { id: "power", label: "Moc", icon: Activity },
  { id: "divider", label: "Dzielnik", icon: Divide },
  { id: "rc", label: "RC", icon: RadioTower },
  { id: "frequency", label: "f ↔ T", icon: Waves },
  { id: "vpp", label: "Vpp", icon: Sigma },
];

const capacitanceMultipliers = {
  F: 1,
  uF: 1e-6,
  nF: 1e-9,
  pF: 1e-12,
};

const frequencyMultipliers = {
  Hz: 1,
  kHz: 1e3,
  MHz: 1e6,
};

const periodMultipliers = {
  s: 1,
  ms: 1e-3,
  us: 1e-6,
  ns: 1e-9,
};

function firstError(...errors: Array<string | null>): string | null {
  return errors.find(Boolean) ?? null;
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function ResultBox({ result, error }: { result: CalculatorResult | null; error: string | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Gauge size={18} aria-hidden="true" />
        Wynik
      </div>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {!error && result ? (
        <p className="mt-3 break-words text-2xl font-bold text-slate-950">
          {result.label}: {formatEngineeringNumber(result.value)} {result.unit}
        </p>
      ) : null}
      {!error && !result ? (
        <p className="mt-3 text-sm text-slate-500">Wpisz dane wejściowe.</p>
      ) : null}
    </div>
  );
}

export function CalculatorPanel() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorId>("ohm");

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {calculators.map((calculator) => {
          const Icon = calculator.icon;
          const active = activeCalculator === calculator.id;

          return (
            <button
              className={`touch-button border ${
                active
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
              key={calculator.id}
              onClick={() => setActiveCalculator(calculator.id)}
              type="button"
            >
              <Icon size={18} aria-hidden="true" />
              {calculator.label}
            </button>
          );
        })}
      </div>

      <div className="panel">
        {activeCalculator === "ohm" ? <OhmsLawCalculator /> : null}
        {activeCalculator === "power" ? <PowerCalculator /> : null}
        {activeCalculator === "divider" ? <VoltageDividerCalculator /> : null}
        {activeCalculator === "rc" ? <RcCalculator /> : null}
        {activeCalculator === "frequency" ? <FrequencyCalculator /> : null}
        {activeCalculator === "vpp" ? <VppCalculator /> : null}
      </div>
    </section>
  );
}

function OhmsLawCalculator() {
  const [target, setTarget] = useState<OhmsLawTarget>("voltage");
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [resistance, setResistance] = useState("");

  const { result, error } = useMemo(() => {
    const u = parseDecimal(voltage);
    const i = parseDecimal(current);
    const r = parseDecimal(resistance);

    if (target === "voltage") {
      const validation = firstError(
        validateFiniteInputs([["Prąd", i]]),
        validatePositiveInputs([["Rezystancja", r]]),
      );
      return validation
        ? { result: null, error: validation }
        : { result: calculateOhmsLaw(target, { current: i, resistance: r }), error: null };
    }

    if (target === "current") {
      const validation = firstError(
        validateFiniteInputs([["Napięcie", u]]),
        validatePositiveInputs([["Rezystancja", r]]),
      );
      return validation
        ? { result: null, error: validation }
        : { result: calculateOhmsLaw(target, { voltage: u, resistance: r }), error: null };
    }

    const validation = firstError(
      validateFiniteInputs([["Napięcie", u]]),
      validateNonZeroInputs([["Prąd", i]]),
    );
    return validation
      ? { result: null, error: validation }
      : { result: calculateOhmsLaw(target, { voltage: u, current: i }), error: null };
  }, [current, resistance, target, voltage]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">Prawo Ohma</h2>
      <label className="block">
        <span className="field-label">Oblicz</span>
        <select
          className="field-input"
          value={target}
          onChange={(event) => setTarget(event.target.value as OhmsLawTarget)}
        >
          <option value="voltage">Napięcie U</option>
          <option value="current">Prąd I</option>
          <option value="resistance">Rezystancję R</option>
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        {target !== "voltage" ? (
          <NumberField label="Napięcie U [V]" value={voltage} onChange={setVoltage} />
        ) : null}
        {target !== "current" ? (
          <NumberField label="Prąd I [A]" value={current} onChange={setCurrent} />
        ) : null}
        {target !== "resistance" ? (
          <NumberField label="Rezystancja R [Ω]" value={resistance} onChange={setResistance} />
        ) : null}
      </div>
      <ResultBox result={result} error={error} />
    </div>
  );
}

function PowerCalculator() {
  const [mode, setMode] = useState<PowerMode>("ui");
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [resistance, setResistance] = useState("");

  const { result, error } = useMemo(() => {
    const u = parseDecimal(voltage);
    const i = parseDecimal(current);
    const r = parseDecimal(resistance);

    if (mode === "ui") {
      const validation = validateFiniteInputs([
        ["Napięcie", u],
        ["Prąd", i],
      ]);
      return validation
        ? { result: null, error: validation }
        : { result: calculatePower(mode, { voltage: u, current: i }), error: null };
    }

    if (mode === "ur") {
      const validation = firstError(
        validateFiniteInputs([["Napięcie", u]]),
        validatePositiveInputs([["Rezystancja", r]]),
      );
      return validation
        ? { result: null, error: validation }
        : { result: calculatePower(mode, { voltage: u, resistance: r }), error: null };
    }

    const validation = firstError(
      validateFiniteInputs([["Prąd", i]]),
      validatePositiveInputs([["Rezystancja", r]]),
    );
    return validation
      ? { result: null, error: validation }
      : { result: calculatePower(mode, { current: i, resistance: r }), error: null };
  }, [current, mode, resistance, voltage]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">Moc elektryczna</h2>
      <label className="block">
        <span className="field-label">Tryb</span>
        <select
          className="field-input"
          value={mode}
          onChange={(event) => setMode(event.target.value as PowerMode)}
        >
          <option value="ui">P = U × I</option>
          <option value="ur">P = U² / R</option>
          <option value="ir">P = I² × R</option>
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        {mode !== "ir" ? (
          <NumberField label="Napięcie U [V]" value={voltage} onChange={setVoltage} />
        ) : null}
        {mode !== "ur" ? (
          <NumberField label="Prąd I [A]" value={current} onChange={setCurrent} />
        ) : null}
        {mode !== "ui" ? (
          <NumberField label="Rezystancja R [Ω]" value={resistance} onChange={setResistance} />
        ) : null}
      </div>
      <ResultBox result={result} error={error} />
    </div>
  );
}

function VoltageDividerCalculator() {
  const [inputVoltage, setInputVoltage] = useState("");
  const [topResistance, setTopResistance] = useState("");
  const [bottomResistance, setBottomResistance] = useState("");

  const { result, error } = useMemo(() => {
    const vin = parseDecimal(inputVoltage);
    const r1 = parseDecimal(topResistance);
    const r2 = parseDecimal(bottomResistance);
    const denominator = r1 + r2;
    const validation = firstError(
      validateFiniteInputs([["Napięcie wejściowe", vin]]),
      validatePositiveInputs([
        ["R1", r1],
        ["R2", r2],
      ]),
      denominator === 0 ? "Suma R1 i R2 musi być różna od zera." : null,
    );

    return validation
      ? { result: null, error: validation }
      : {
          result: calculateVoltageDivider({
            inputVoltage: vin,
            topResistance: r1,
            bottomResistance: r2,
          }),
          error: null,
        };
  }, [bottomResistance, inputVoltage, topResistance]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">Dzielnik napięcia</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField label="Vin [V]" value={inputVoltage} onChange={setInputVoltage} />
        <NumberField label="R1 [Ω]" value={topResistance} onChange={setTopResistance} />
        <NumberField label="R2 [Ω]" value={bottomResistance} onChange={setBottomResistance} />
      </div>
      <ResultBox result={result} error={error} />
    </div>
  );
}

function RcCalculator() {
  const [resistance, setResistance] = useState("");
  const [capacitance, setCapacitance] = useState("");
  const [capacitanceUnit, setCapacitanceUnit] =
    useState<keyof typeof capacitanceMultipliers>("nF");

  const { result, error } = useMemo(() => {
    const r = parseDecimal(resistance);
    const c = parseDecimal(capacitance) * capacitanceMultipliers[capacitanceUnit];
    const validation = validatePositiveInputs([
      ["Rezystancja", r],
      ["Pojemność", c],
    ]);

    return validation
      ? { result: null, error: validation }
      : { result: calculateRcCutoff(r, c), error: null };
  }, [capacitance, capacitanceUnit, resistance]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">Filtr RC</h2>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_112px]">
        <NumberField label="Rezystancja R [Ω]" value={resistance} onChange={setResistance} />
        <NumberField label="Pojemność C" value={capacitance} onChange={setCapacitance} />
        <label className="block">
          <span className="field-label">Jednostka</span>
          <select
            className="field-input"
            value={capacitanceUnit}
            onChange={(event) =>
              setCapacitanceUnit(event.target.value as keyof typeof capacitanceMultipliers)
            }
          >
            <option value="F">F</option>
            <option value="uF">µF</option>
            <option value="nF">nF</option>
            <option value="pF">pF</option>
          </select>
        </label>
      </div>
      <ResultBox result={result} error={error} />
    </div>
  );
}

function FrequencyCalculator() {
  const [mode, setMode] = useState<FrequencyMode>("frequencyToPeriod");
  const [value, setValue] = useState("");
  const [frequencyUnit, setFrequencyUnit] = useState<keyof typeof frequencyMultipliers>("Hz");
  const [periodUnit, setPeriodUnit] = useState<keyof typeof periodMultipliers>("ms");

  const { result, error } = useMemo(() => {
    const label = mode === "frequencyToPeriod" ? "Częstotliwość" : "Okres";
    const baseValue =
      mode === "frequencyToPeriod"
        ? parseDecimal(value) * frequencyMultipliers[frequencyUnit]
        : parseDecimal(value) * periodMultipliers[periodUnit];
    const validation = validatePositiveInputs([[label, baseValue]]);

    return validation
      ? { result: null, error: validation }
      : { result: calculateFrequencyPeriod(mode, baseValue), error: null };
  }, [frequencyUnit, mode, periodUnit, value]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">Częstotliwość i okres</h2>
      <label className="block">
        <span className="field-label">Konwersja</span>
        <select
          className="field-input"
          value={mode}
          onChange={(event) => setMode(event.target.value as FrequencyMode)}
        >
          <option value="frequencyToPeriod">Częstotliwość → okres</option>
          <option value="periodToFrequency">Okres → częstotliwość</option>
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-[1fr_112px]">
        <NumberField
          label={mode === "frequencyToPeriod" ? "Częstotliwość" : "Okres"}
          value={value}
          onChange={setValue}
        />
        <label className="block">
          <span className="field-label">Jednostka</span>
          {mode === "frequencyToPeriod" ? (
            <select
              className="field-input"
              value={frequencyUnit}
              onChange={(event) =>
                setFrequencyUnit(event.target.value as keyof typeof frequencyMultipliers)
              }
            >
              <option value="Hz">Hz</option>
              <option value="kHz">kHz</option>
              <option value="MHz">MHz</option>
            </select>
          ) : (
            <select
              className="field-input"
              value={periodUnit}
              onChange={(event) =>
                setPeriodUnit(event.target.value as keyof typeof periodMultipliers)
              }
            >
              <option value="s">s</option>
              <option value="ms">ms</option>
              <option value="us">µs</option>
              <option value="ns">ns</option>
            </select>
          )}
        </label>
      </div>
      <ResultBox result={result} error={error} />
    </div>
  );
}

function VppCalculator() {
  const [mode, setMode] = useState<VppMode>("vppToVrms");
  const [value, setValue] = useState("");

  const { result, error } = useMemo(() => {
    const voltage = parseDecimal(value);
    const validation = validatePositiveInputs([[mode === "vppToVrms" ? "Vpp" : "Vrms", voltage]]);

    return validation
      ? { result: null, error: validation }
      : { result: calculateVppVrms(mode, voltage), error: null };
  }, [mode, value]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">Vpp i Vrms</h2>
      <label className="block">
        <span className="field-label">Konwersja</span>
        <select
          className="field-input"
          value={mode}
          onChange={(event) => setMode(event.target.value as VppMode)}
        >
          <option value="vppToVrms">Vpp → Vrms</option>
          <option value="vrmsToVpp">Vrms → Vpp</option>
        </select>
      </label>
      <NumberField
        label={mode === "vppToVrms" ? "Vpp [V]" : "Vrms [V]"}
        value={value}
        onChange={setValue}
      />
      <ResultBox result={result} error={error} />
    </div>
  );
}
