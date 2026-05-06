import type { CalculatorResult, WaveformRmsInput, WaveformType } from "../../types";

const SQRT_TWO = Math.sqrt(2);
const SQRT_THREE = Math.sqrt(3);

export type WaveformValidationError =
  | "customFactor"
  | "dutyCycle"
  | "offsetTooHigh"
  | "value";

function dutyRatio(dutyCyclePercent = 50): number {
  return dutyCyclePercent / 100;
}

export function waveformConversionFactor(
  waveform: Exclude<WaveformType, "pwm">,
  customFactor = 2 * SQRT_TWO,
): number {
  if (waveform === "sine") {
    return 2 * SQRT_TWO;
  }

  if (waveform === "square") {
    return 2;
  }

  if (waveform === "triangle" || waveform === "sawtooth") {
    return 2 * SQRT_THREE;
  }

  if (waveform === "dc") {
    return 1;
  }

  return customFactor;
}

export function validateWaveformRmsInput(input: WaveformRmsInput): WaveformValidationError | null {
  if (!Number.isFinite(input.value) || input.value <= 0) {
    return "value";
  }

  if (input.waveform === "pwm") {
    const dutyCyclePercent = input.dutyCyclePercent ?? Number.NaN;

    if (
      !Number.isFinite(dutyCyclePercent) ||
      dutyCyclePercent < 0 ||
      dutyCyclePercent > 100
    ) {
      return "dutyCycle";
    }
  }

  if (input.waveform === "custom") {
    const customFactor = input.customFactor ?? Number.NaN;

    if (!Number.isFinite(customFactor) || customFactor <= 0) {
      return "customFactor";
    }
  }

  const offset = input.offset ?? 0;

  if (!Number.isFinite(offset)) {
    return "value";
  }

  if (input.mode === "vrmsToVpp" && Math.abs(offset) > input.value) {
    return "offsetTooHigh";
  }

  return null;
}

export function calculateWaveformRms(input: WaveformRmsInput): CalculatorResult {
  const validationError = validateWaveformRmsInput(input);

  if (validationError) {
    return { label: "Invalid", value: Number.NaN, unit: "V" };
  }

  const offset = input.offset ?? 0;

  if (input.mode === "vppToVrms") {
    if (input.waveform === "pwm") {
      const acRms = input.value * Math.sqrt(dutyRatio(input.dutyCyclePercent));
      return { label: "Vrms", value: Math.hypot(acRms, offset), unit: "V" };
    }

    if (input.waveform === "dc") {
      return { label: "Vrms", value: Math.abs(input.value + offset), unit: "V" };
    }

    const factor = waveformConversionFactor(input.waveform, input.customFactor);
    const acRms = input.value / factor;
    return { label: "Vrms", value: Math.hypot(acRms, offset), unit: "V" };
  }

  const acRms = Math.sqrt(Math.max(input.value * input.value - offset * offset, 0));

  if (input.waveform === "pwm") {
    const ratio = dutyRatio(input.dutyCyclePercent);
    return {
      label: "Vpp",
      value: ratio === 0 ? 0 : acRms / Math.sqrt(ratio),
      unit: "V",
    };
  }

  if (input.waveform === "dc") {
    return { label: "Vpp", value: acRms, unit: "V" };
  }

  const factor = waveformConversionFactor(input.waveform, input.customFactor);
  return { label: "Vpp", value: acRms * factor, unit: "V" };
}
