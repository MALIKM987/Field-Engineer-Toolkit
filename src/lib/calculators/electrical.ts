import type {
  CalculatorResult,
  FrequencyMode,
  OhmsLawTarget,
  PowerMode,
  VppMode,
} from "../../types";

const TWO_PI = 2 * Math.PI;
const SQRT_TWO = Math.sqrt(2);

export function calculateOhmsLaw(
  target: OhmsLawTarget,
  values: { voltage?: number; current?: number; resistance?: number },
): CalculatorResult {
  if (target === "voltage") {
    return { label: "Napięcie", value: values.current! * values.resistance!, unit: "V" };
  }

  if (target === "current") {
    return { label: "Prąd", value: values.voltage! / values.resistance!, unit: "A" };
  }

  return { label: "Rezystancja", value: values.voltage! / values.current!, unit: "Ω" };
}

export function calculatePower(
  mode: PowerMode,
  values: { voltage?: number; current?: number; resistance?: number },
): CalculatorResult {
  if (mode === "ui") {
    return { label: "Moc", value: values.voltage! * values.current!, unit: "W" };
  }

  if (mode === "ur") {
    return {
      label: "Moc",
      value: (values.voltage! * values.voltage!) / values.resistance!,
      unit: "W",
    };
  }

  return { label: "Moc", value: values.current! * values.current! * values.resistance!, unit: "W" };
}

export function calculateVoltageDivider(values: {
  inputVoltage: number;
  topResistance: number;
  bottomResistance: number;
}): CalculatorResult {
  const value =
    values.inputVoltage *
    (values.bottomResistance / (values.topResistance + values.bottomResistance));

  return { label: "Napięcie wyjściowe", value, unit: "V" };
}

export function calculateRcCutoff(resistanceOhm: number, capacitanceFarad: number): CalculatorResult {
  return {
    label: "Częstotliwość odcięcia",
    value: 1 / (TWO_PI * resistanceOhm * capacitanceFarad),
    unit: "Hz",
  };
}

export function calculateFrequencyPeriod(mode: FrequencyMode, value: number): CalculatorResult {
  if (mode === "frequencyToPeriod") {
    return { label: "Okres", value: 1 / value, unit: "s" };
  }

  return { label: "Częstotliwość", value: 1 / value, unit: "Hz" };
}

export function calculateVppVrms(mode: VppMode, value: number): CalculatorResult {
  if (mode === "vppToVrms") {
    return { label: "Vrms", value: value / (2 * SQRT_TWO), unit: "V" };
  }

  return { label: "Vpp", value: value * 2 * SQRT_TWO, unit: "V" };
}
