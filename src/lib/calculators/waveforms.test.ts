import { describe, expect, it } from "vitest";
import { calculateWaveformRms, validateWaveformRmsInput } from "./waveforms";

describe("waveform RMS calculator", () => {
  it("calculates sine Vpp to Vrms", () => {
    expect(
      calculateWaveformRms({ mode: "vppToVrms", value: 2 * Math.sqrt(2), waveform: "sine" }).value,
    ).toBeCloseTo(1, 12);
  });

  it("calculates symmetric square Vpp to Vrms", () => {
    expect(calculateWaveformRms({ mode: "vppToVrms", value: 10, waveform: "square" }).value).toBeCloseTo(5, 12);
  });

  it("calculates triangle Vpp to Vrms", () => {
    expect(calculateWaveformRms({ mode: "vppToVrms", value: 2 * Math.sqrt(3), waveform: "triangle" }).value).toBeCloseTo(1, 12);
  });

  it("calculates sawtooth Vpp to Vrms", () => {
    expect(calculateWaveformRms({ mode: "vppToVrms", value: 2 * Math.sqrt(3), waveform: "sawtooth" }).value).toBeCloseTo(1, 12);
  });

  it("calculates total Vrms with DC offset", () => {
    expect(
      calculateWaveformRms({ mode: "vppToVrms", offset: 3, value: 2 * Math.sqrt(2), waveform: "sine" }).value,
    ).toBeCloseTo(Math.sqrt(10), 12);
  });

  it("calculates PWM for different duty cycles", () => {
    expect(
      calculateWaveformRms({
        dutyCyclePercent: 25,
        mode: "vppToVrms",
        value: 10,
        waveform: "pwm",
      }).value,
    ).toBeCloseTo(5, 12);
    expect(
      calculateWaveformRms({
        dutyCyclePercent: 100,
        mode: "vppToVrms",
        value: 10,
        waveform: "pwm",
      }).value,
    ).toBeCloseTo(10, 12);
  });

  it("rejects invalid duty cycle", () => {
    expect(
      validateWaveformRmsInput({
        dutyCyclePercent: 120,
        mode: "vppToVrms",
        value: 10,
        waveform: "pwm",
      }),
    ).toBe("dutyCycle");
  });

  it("rejects invalid custom factor", () => {
    expect(
      validateWaveformRmsInput({
        customFactor: 0,
        mode: "vppToVrms",
        value: 10,
        waveform: "custom",
      }),
    ).toBe("customFactor");
  });
});
