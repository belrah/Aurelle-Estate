import { properties, type Property } from "../../data";
export const MAX_COMPARE = 4;
export const amenities = [
  ["school", "Schools"],
  ["hospital", "Healthcare"],
  ["market", "Shops & markets"],
  ["transport", "Public transport"],
  ["mainRoad", "Main-road access"],
] as const;
export type Amenity = (typeof amenities)[number][0];
export type Assessment = {
  extra: number | null;
  running: number | null;
  nights: number;
  distances: Partial<Record<Amenity, number>>;
  road: string;
  notes: string;
};
export const blankAssessment = (): Assessment => ({
  extra: null,
  running: null,
  nights: 7,
  distances: {},
  road: "Not assessed",
  notes: "",
});
export function validSelection(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is string =>
              typeof id === "string" && properties.some((p) => p.slug === id),
          ),
        ),
      ].slice(0, MAX_COMPARE)
    : [];
}
export function quoteBasis(p: Property) {
  return p.period.includes("night")
    ? "night"
    : p.period.includes("year")
      ? "year"
      : "purchase";
}
export function comparable(items: Property[]) {
  return (
    items.length > 1 &&
    items.every(
      (p) =>
        p.category === items[0].category &&
        quoteBasis(p) === quoteBasis(items[0]) &&
        (p.type === "Land") === (items[0].type === "Land"),
    )
  );
}
export function unitPrice(p: Property): number | null {
  return Number.isFinite(p.area) &&
    p.area > 0 &&
    Number.isFinite(p.price) &&
    p.price >= 0
    ? p.price / p.area
    : null;
}
export function cleanAssessment(value: unknown): Assessment {
  const result = blankAssessment();
  if (!value || typeof value !== "object") return result;
  const v = value as Record<string, unknown>;
  for (const key of ["extra", "running"] as const)
    if (typeof v[key] === "number" && Number.isFinite(v[key]))
      result[key] = Math.max(0, Math.min(1e12, v[key]));
  if (typeof v.nights === "number" && Number.isFinite(v.nights))
    result.nights = Math.max(1, Math.min(365, Math.floor(v.nights)));
  if (typeof v.notes === "string") result.notes = v.notes.slice(0, 1000);
  if (
    typeof v.road === "string" &&
    ["Not assessed", "Paved", "Unpaved", "Mixed"].includes(v.road)
  )
    result.road = v.road;
  if (v.distances && typeof v.distances === "object")
    for (const [key] of amenities) {
      const n = (v.distances as Record<string, unknown>)[key];
      if (typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 10000)
        result.distances[key] = n;
    }
  return result;
}
export function budgetTotal(p: Property, input: Assessment) {
  const a = cleanAssessment(input);
  return (
    p.price * (quoteBasis(p) === "night" ? a.nights : 1) +
    (a.extra ?? 0) +
    (a.running ?? 0)
  );
}
