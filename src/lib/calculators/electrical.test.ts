import { describe, expect, it } from "vitest";
import {
  calculateFrequencyPeriod,
  calculateOhmsLaw,
  calculatePower,
  calculateRcCutoff,
  calculateVoltageDivider,
  calculateVppVrms,
} from "./electrical";

describe("electrical calculators", () => {
  it("calculates Ohm's law targets", () => {
    expect(calculateOhmsLaw("voltage", { current: 2, resistance: 10 })).toMatchObject({
      value: 20,
      unit: "V",
    });
    expect(calculateOhmsLaw("current", { voltage: 5, resistance: 10 })).toMatchObject({
      value: 0.5,
      unit: "A",
    });
    expect(calculateOhmsLaw("resistance", { voltage: 10, current: 2 })).toMatchObject({
      value: 5,
      unit: "Ω",
    });
  });

  it("calculates electrical power", () => {
    expect(calculatePower("ui", { voltage: 12, current: 2 }).value).toBe(24);
    expect(calculatePower("ur", { voltage: 12, resistance: 6 }).value).toBe(24);
    expect(calculatePower("ir", { current: 2, resistance: 6 }).value).toBe(24);
  });

  it("calculates voltage divider output", () => {
    const result = calculateVoltageDivider({
      inputVoltage: 12,
      topResistance: 1000,
      bottomResistance: 1000,
    });

    expect(result.value).toBe(6);
    expect(result.unit).toBe("V");
  });

  it("calculates RC filter cutoff frequency", () => {
    const result = calculateRcCutoff(1000, 1e-6);

    expect(result.value).toBeCloseTo(159.154943, 6);
    expect(result.unit).toBe("Hz");
  });

  it("converts frequency and period", () => {
    expect(calculateFrequencyPeriod("frequencyToPeriod", 1000)).toMatchObject({
      value: 0.001,
      unit: "s",
    });
    expect(calculateFrequencyPeriod("periodToFrequency", 0.002)).toMatchObject({
      value: 500,
      unit: "Hz",
    });
  });

  it("converts Vpp and Vrms for sine waves", () => {
    expect(calculateVppVrms("vppToVrms", 2 * Math.sqrt(2)).value).toBeCloseTo(1, 12);
    expect(calculateVppVrms("vrmsToVpp", 1).value).toBeCloseTo(2 * Math.sqrt(2), 12);
  });
});
