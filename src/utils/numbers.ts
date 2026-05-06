export function parseDecimal(value: string): number {
  return Number(value.replace(",", ".").trim());
}

export function isPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function formatEngineeringNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "-";
  }

  const absolute = Math.abs(value);

  if (absolute === 0) {
    return "0";
  }

  if (absolute >= 1_000_000 || absolute < 0.001) {
    return value.toExponential(4);
  }

  return new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 6,
  }).format(value);
}
