import { describe, expect, it } from "vitest";
import {
  validateFiniteInputs,
  validateNonZeroInputs,
  validatePositiveInputs,
} from "./validation";

describe("calculator input validation", () => {
  it("accepts valid finite numbers", () => {
    expect(
      validateFiniteInputs([
        ["Napięcie", -12],
        ["Prąd", 0],
        ["Rezystancja", 10],
      ]),
    ).toBeNull();
  });

  it("rejects NaN values", () => {
    expect(validateFiniteInputs([["Napięcie", Number.NaN]])).toContain("Napięcie");
  });

  it("rejects zero for non-zero inputs", () => {
    expect(validateNonZeroInputs([["Prąd", 0]])).toContain("Prąd");
  });

  it("accepts negative values for non-zero inputs", () => {
    expect(validateNonZeroInputs([["Prąd", -0.25]])).toBeNull();
  });

  it("rejects negative resistance", () => {
    expect(validatePositiveInputs([["Rezystancja", -10]])).toContain("Rezystancja");
  });

  it("rejects zero frequency", () => {
    expect(validatePositiveInputs([["Częstotliwość", 0]])).toContain("Częstotliwość");
  });

  it("rejects zero capacitance", () => {
    expect(validatePositiveInputs([["Pojemność", 0]])).toContain("Pojemność");
  });
});
