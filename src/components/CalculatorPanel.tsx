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
  WaveformType,
  VppMode,
} from "../types";
import {
  calculateFrequencyPeriod,
  calculateOhmsLaw,
  calculatePower,
  calculateRcCutoff,
  calculateVoltageDivider,
} from "../lib/calculators/electrical";
import { calculateWaveformRms, validateWaveformRmsInput } from "../lib/calculators/waveforms";
import { useI18n } from "../i18n";
import { formatEngineeringNumber, parseDecimal } from "../utils/numbers";
import {
  validateFiniteInputs,
  validateNonZeroInputs,
  validatePositiveInputs,
} from "../utils/validation";

const calculators: Array<{ id: CalculatorId; icon: typeof Zap }> = [
  { id: "ohm", icon: Zap },
  { id: "power", icon: Activity },
  { id: "divider", icon: Divide },
  { id: "rc", icon: RadioTower },
  { id: "frequency", icon: Waves },
  { id: "vpp", icon: Sigma },
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

function useNumericMessages() {
  const { t } = useI18n();

  return useMemo(
    () => ({
      finite: (label: string) => t("validationMustBeFinite", { label }),
      nonZero: (label: string) => t("validationMustBeNonZero", { label }),
      positive: (label: string) => t("validationMustBePositive", { label }),
    }),
    [t],
  );
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
  const { t } = useI18n();

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Gauge size={18} aria-hidden="true" />
        {t("calcResult")}
      </div>
      {error ? <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      {!error && result ? (
        <p className="mt-3 break-words text-2xl font-bold text-slate-950">
          {result.label}: {formatEngineeringNumber(result.value)} {result.unit}
        </p>
      ) : null}
      {!error && !result ? (
        <p className="mt-3 text-sm text-slate-500">{t("calcEnterInput")}</p>
      ) : null}
    </div>
  );
}

export function CalculatorPanel() {
  const { t } = useI18n();
  const [activeCalculator, setActiveCalculator] = useState<CalculatorId>("ohm");
  const labels: Record<CalculatorId, string> = {
    divider: t("calcDivider"),
    frequency: "f ↔ T",
    ohm: "Ohm",
    power: t("calcPower"),
    rc: "RC",
    vpp: "Vpp",
  };

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
                  ? "border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-400 dark:text-slate-950"
                  : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              }`}
              key={calculator.id}
              onClick={() => setActiveCalculator(calculator.id)}
              type="button"
            >
              <Icon size={18} aria-hidden="true" />
              {labels[calculator.id]}
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
        {activeCalculator === "vpp" ? <WaveformRmsCalculator /> : null}
      </div>
    </section>
  );
}

function OhmsLawCalculator() {
  const { t } = useI18n();
  const numericMessages = useNumericMessages();
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
        validateFiniteInputs([[t("calcCurrent"), i]], numericMessages),
        validatePositiveInputs([[t("calcResistance"), r]], numericMessages),
      );
      return validation
        ? { result: null, error: validation }
        : { result: calculateOhmsLaw(target, { current: i, resistance: r }), error: null };
    }

    if (target === "current") {
      const validation = firstError(
        validateFiniteInputs([[t("calcVoltage"), u]], numericMessages),
        validatePositiveInputs([[t("calcResistance"), r]], numericMessages),
      );
      return validation
        ? { result: null, error: validation }
        : { result: calculateOhmsLaw(target, { voltage: u, resistance: r }), error: null };
    }

    const validation = firstError(
      validateFiniteInputs([[t("calcVoltage"), u]], numericMessages),
      validateNonZeroInputs([[t("calcCurrent"), i]], numericMessages),
    );
    return validation
      ? { result: null, error: validation }
      : { result: calculateOhmsLaw(target, { voltage: u, current: i }), error: null };
  }, [current, numericMessages, resistance, t, target, voltage]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">{t("calcOhm")}</h2>
      <label className="block">
        <span className="field-label">{t("calcCalculate")}</span>
        <select
          className="field-input"
          value={target}
          onChange={(event) => setTarget(event.target.value as OhmsLawTarget)}
        >
          <option value="voltage">{t("calcVoltage")} U</option>
          <option value="current">{t("calcCurrent")} I</option>
          <option value="resistance">{t("calcResistance")} R</option>
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        {target !== "voltage" ? (
          <NumberField label={`${t("calcVoltage")} U [V]`} value={voltage} onChange={setVoltage} />
        ) : null}
        {target !== "current" ? (
          <NumberField label={`${t("calcCurrent")} I [A]`} value={current} onChange={setCurrent} />
        ) : null}
        {target !== "resistance" ? (
          <NumberField label={`${t("calcResistance")} R [Ω]`} value={resistance} onChange={setResistance} />
        ) : null}
      </div>
      <ResultBox result={result} error={error} />
    </div>
  );
}

function PowerCalculator() {
  const { t } = useI18n();
  const numericMessages = useNumericMessages();
  const [mode, setMode] = useState<PowerMode>("ui");
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [resistance, setResistance] = useState("");

  const { result, error } = useMemo(() => {
    const u = parseDecimal(voltage);
    const i = parseDecimal(current);
    const r = parseDecimal(resistance);

    if (mode === "ui") {
      const validation = validateFiniteInputs(
        [
          [t("calcVoltage"), u],
          [t("calcCurrent"), i],
        ],
        numericMessages,
      );
      return validation
        ? { result: null, error: validation }
        : { result: calculatePower(mode, { voltage: u, current: i }), error: null };
    }

    if (mode === "ur") {
      const validation = firstError(
        validateFiniteInputs([[t("calcVoltage"), u]], numericMessages),
        validatePositiveInputs([[t("calcResistance"), r]], numericMessages),
      );
      return validation
        ? { result: null, error: validation }
        : { result: calculatePower(mode, { voltage: u, resistance: r }), error: null };
    }

    const validation = firstError(
      validateFiniteInputs([[t("calcCurrent"), i]], numericMessages),
      validatePositiveInputs([[t("calcResistance"), r]], numericMessages),
    );
    return validation
      ? { result: null, error: validation }
      : { result: calculatePower(mode, { current: i, resistance: r }), error: null };
  }, [current, mode, numericMessages, resistance, t, voltage]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">{t("calcPower")}</h2>
      <label className="block">
        <span className="field-label">{t("calcMode")}</span>
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
          <NumberField label={`${t("calcVoltage")} U [V]`} value={voltage} onChange={setVoltage} />
        ) : null}
        {mode !== "ur" ? (
          <NumberField label={`${t("calcCurrent")} I [A]`} value={current} onChange={setCurrent} />
        ) : null}
        {mode !== "ui" ? (
          <NumberField label={`${t("calcResistance")} R [Ω]`} value={resistance} onChange={setResistance} />
        ) : null}
      </div>
      <ResultBox result={result} error={error} />
    </div>
  );
}

function VoltageDividerCalculator() {
  const { t } = useI18n();
  const numericMessages = useNumericMessages();
  const [inputVoltage, setInputVoltage] = useState("");
  const [topResistance, setTopResistance] = useState("");
  const [bottomResistance, setBottomResistance] = useState("");

  const { result, error } = useMemo(() => {
    const vin = parseDecimal(inputVoltage);
    const r1 = parseDecimal(topResistance);
    const r2 = parseDecimal(bottomResistance);
    const denominator = r1 + r2;
    const validation = firstError(
      validateFiniteInputs([[t("calcInputVoltage"), vin]], numericMessages),
      validatePositiveInputs([
        ["R1", r1],
        ["R2", r2],
      ], numericMessages),
      denominator === 0 ? t("validationMustBeNonZero", { label: "R1 + R2" }) : null,
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
  }, [bottomResistance, inputVoltage, numericMessages, t, topResistance]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">{t("calcDivider")}</h2>
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
  const { t } = useI18n();
  const numericMessages = useNumericMessages();
  const [resistance, setResistance] = useState("");
  const [capacitance, setCapacitance] = useState("");
  const [capacitanceUnit, setCapacitanceUnit] =
    useState<keyof typeof capacitanceMultipliers>("nF");

  const { result, error } = useMemo(() => {
    const r = parseDecimal(resistance);
    const c = parseDecimal(capacitance) * capacitanceMultipliers[capacitanceUnit];
    const validation = validatePositiveInputs(
      [
        [t("calcResistance"), r],
        [t("calcCapacitance"), c],
      ],
      numericMessages,
    );

    return validation
      ? { result: null, error: validation }
      : { result: calculateRcCutoff(r, c), error: null };
  }, [capacitance, capacitanceUnit, numericMessages, resistance, t]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">{t("calcRc")}</h2>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_112px]">
        <NumberField label={`${t("calcResistance")} R [Ω]`} value={resistance} onChange={setResistance} />
        <NumberField label={`${t("calcCapacitance")} C`} value={capacitance} onChange={setCapacitance} />
        <label className="block">
          <span className="field-label">{t("measurementUnit")}</span>
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
  const { t } = useI18n();
  const numericMessages = useNumericMessages();
  const [mode, setMode] = useState<FrequencyMode>("frequencyToPeriod");
  const [value, setValue] = useState("");
  const [frequencyUnit, setFrequencyUnit] = useState<keyof typeof frequencyMultipliers>("Hz");
  const [periodUnit, setPeriodUnit] = useState<keyof typeof periodMultipliers>("ms");

  const { result, error } = useMemo(() => {
    const label = mode === "frequencyToPeriod" ? t("calcFrequencyLabel") : t("calcPeriod");
    const baseValue =
      mode === "frequencyToPeriod"
        ? parseDecimal(value) * frequencyMultipliers[frequencyUnit]
        : parseDecimal(value) * periodMultipliers[periodUnit];
    const validation = validatePositiveInputs([[label, baseValue]], numericMessages);

    return validation
      ? { result: null, error: validation }
      : { result: calculateFrequencyPeriod(mode, baseValue), error: null };
  }, [frequencyUnit, mode, numericMessages, periodUnit, t, value]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">{t("calcFrequency")}</h2>
      <label className="block">
        <span className="field-label">{t("calcConversion")}</span>
        <select
          className="field-input"
          value={mode}
          onChange={(event) => setMode(event.target.value as FrequencyMode)}
        >
          <option value="frequencyToPeriod">{t("calcFrequencyLabel")} → {t("calcPeriod")}</option>
          <option value="periodToFrequency">{t("calcPeriod")} → {t("calcFrequencyLabel")}</option>
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-[1fr_112px]">
        <NumberField
          label={mode === "frequencyToPeriod" ? t("calcFrequencyLabel") : t("calcPeriod")}
          value={value}
          onChange={setValue}
        />
        <label className="block">
          <span className="field-label">{t("measurementUnit")}</span>
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

function WaveformRmsCalculator() {
  const { t } = useI18n();
  const numericMessages = useNumericMessages();
  const [mode, setMode] = useState<VppMode>("vppToVrms");
  const [waveform, setWaveform] = useState<WaveformType>("sine");
  const [value, setValue] = useState("");
  const [offset, setOffset] = useState("0");
  const [dutyCycle, setDutyCycle] = useState("50");
  const [customFactor, setCustomFactor] = useState("2.828427");

  const waveformLabels: Record<WaveformType, string> = {
    sine: t("calcWaveformSine"),
    square: t("calcWaveformSquare"),
    triangle: t("calcWaveformTriangle"),
    sawtooth: t("calcWaveformSawtooth"),
    dc: t("calcWaveformDc"),
    pwm: t("calcWaveformPwm"),
    custom: t("calcWaveformCustom"),
  };

  const { result, error } = useMemo(() => {
    const numericValue = parseDecimal(value);
    const numericOffset = parseDecimal(offset);
    const numericDutyCycle = parseDecimal(dutyCycle);
    const numericCustomFactor = parseDecimal(customFactor);
    const input = {
      customFactor: numericCustomFactor,
      dutyCyclePercent: numericDutyCycle,
      mode,
      offset: numericOffset,
      value: numericValue,
      waveform,
    };
    const basicValidation = firstError(
      validatePositiveInputs([[mode === "vppToVrms" ? "Vpp" : "Vrms", numericValue]], numericMessages),
      validateFiniteInputs([[t("calcOffset"), numericOffset]], numericMessages),
    );

    if (basicValidation) {
      return { result: null, error: basicValidation };
    }

    const waveformError = validateWaveformRmsInput(input);

    if (waveformError === "dutyCycle") {
      return { result: null, error: t("validationDutyCycleRange") };
    }

    if (waveformError === "customFactor") {
      return { result: null, error: t("validationCustomFactorPositive") };
    }

    if (waveformError === "offsetTooHigh") {
      return { result: null, error: t("validationOffsetTooHigh") };
    }

    if (waveformError) {
      return { result: null, error: t("validationMustBePositive", { label: mode === "vppToVrms" ? "Vpp" : "Vrms" }) };
    }

    return { result: calculateWaveformRms(input), error: null };
  }, [customFactor, dutyCycle, mode, numericMessages, offset, t, value, waveform]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-950">{t("calcVpp")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">{t("calcConversion")}</span>
          <select
            className="field-input"
            value={mode}
            onChange={(event) => setMode(event.target.value as VppMode)}
          >
            <option value="vppToVrms">Vpp → Vrms</option>
            <option value="vrmsToVpp">Vrms → Vpp</option>
          </select>
        </label>
        <label className="block">
          <span className="field-label">{t("calcWaveform")}</span>
          <select
            className="field-input"
            value={waveform}
            onChange={(event) => setWaveform(event.target.value as WaveformType)}
          >
            {Object.entries(waveformLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={mode === "vppToVrms" ? "Vpp [V]" : "Vrms [V]"}
          value={value}
          onChange={setValue}
        />
        <NumberField label={t("calcOffset")} value={offset} onChange={setOffset} />
      </div>

      {waveform === "pwm" ? (
        <NumberField label={t("calcDutyCycle")} value={dutyCycle} onChange={setDutyCycle} />
      ) : null}

      {waveform === "custom" ? (
        <NumberField label={t("calcCustomFactor")} value={customFactor} onChange={setCustomFactor} />
      ) : null}

      <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
        {t("calcIdealWaveforms")}
      </p>

      <ResultBox result={result} error={error} />
    </div>
  );
}
