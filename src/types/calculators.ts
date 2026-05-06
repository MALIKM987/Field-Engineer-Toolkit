export type CalculatorId =
  | "ohm"
  | "power"
  | "divider"
  | "rc"
  | "frequency"
  | "vpp";

export type OhmsLawTarget = "voltage" | "current" | "resistance";
export type PowerMode = "ui" | "ur" | "ir";
export type FrequencyMode = "frequencyToPeriod" | "periodToFrequency";
export type VppMode = "vppToVrms" | "vrmsToVpp";
export type WaveformType =
  | "sine"
  | "square"
  | "triangle"
  | "sawtooth"
  | "dc"
  | "pwm"
  | "custom";

export interface CalculatorResult {
  label: string;
  value: number;
  unit: string;
}

export interface WaveformRmsInput {
  customFactor?: number;
  dutyCyclePercent?: number;
  mode: VppMode;
  offset?: number;
  value: number;
  waveform: WaveformType;
}
