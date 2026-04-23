export type TestType = "VIGOR" | "EA72" | "EA48" | "EA24" | "AREIA" | "GERM";

export type ThresholdMap = Partial<Record<TestType, number | null>>;

export const TEST_TYPES: TestType[] = [
  "VIGOR",
  "EA72",
  "EA48",
  "EA24",
  "AREIA",
  "GERM",
];

// Returns "***" when the value is below the configured minimum for a given
// test type, otherwise returns the formatted value (or an empty string when
// the value is absent).
export function applyThreshold(
  testType: TestType,
  value: number | null | undefined,
  thresholds: ThresholdMap,
  digits = 0
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  const min = thresholds[testType];
  if (typeof min === "number" && value < min) return "***";
  return value.toFixed(digits);
}
