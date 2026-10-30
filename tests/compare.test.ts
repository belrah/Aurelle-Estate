import { describe, it, expect } from "vitest";
import { properties } from "../src/data";
import {
  blankAssessment,
  budgetTotal,
  cleanAssessment,
  comparable,
  unitPrice,
  validSelection,
} from "../src/features/compare/model";

describe("property comparisons", () => {
  it("keeps known, unique listing IDs only and limits the shortlist to four", () => {
    expect(
      validSelection([
        properties[0].slug,
        "unknown",
        properties[0].slug,
        ...properties.map((p) => p.slug),
        5,
      ]),
    ).toEqual(properties.slice(0, 4).map((p) => p.slug));
    expect(validSelection({ slug: properties[0].slug })).toEqual([]);
  });
  it("only ranks asking prices within matching categories and payment periods", () => {
    expect(comparable([properties[0], properties[2]])).toBe(true);
    expect(comparable([properties[0], properties[1]])).toBe(false);
    expect(comparable([properties[0], properties[3]])).toBe(false);
    expect(comparable([properties[4], properties[5]])).toBe(false);
    expect(comparable([properties[0]])).toBe(false);
    expect(comparable([properties[3], properties[6]])).toBe(true);
  });
  it("uses quoted area for an indicative unit price and rejects invalid areas", () => {
    expect(unitPrice(properties[3])).toBeCloseTo(25000000 / 600);
    expect(unitPrice({ ...properties[3], area: 0 })).toBeNull();
    expect(unitPrice({ ...properties[3], area: NaN })).toBeNull();
    expect(unitPrice({ ...properties[3], price: Infinity })).toBeNull();
  });
  it("adds explicit costs to a purchase without assuming fees", () => {
    expect(blankAssessment().extra).toBeNull();
    expect(cleanAssessment({ extra: 0 }).extra).toBe(0);
    expect(budgetTotal(properties[0], blankAssessment())).toBe(285000000);
    expect(
      budgetTotal(properties[0], {
        ...blankAssessment(),
        extra: 500000,
        running: 250000,
      }),
    ).toBe(285750000);
  });
  it("uses exactly one annual rent quote and the requested number of nights for stays", () => {
    expect(
      budgetTotal(properties[1], { ...blankAssessment(), extra: 100000 }),
    ).toBe(18100000);
    expect(
      budgetTotal(properties[4], {
        ...blankAssessment(),
        nights: 3,
        extra: 10000,
        running: 5000,
      }),
    ).toBe(465000);
  });
  it("keeps unknown amenity distances distinct from an entered zero", () => {
    const a = cleanAssessment({
      distances: { school: 0, hospital: -1, market: NaN, transport: "2" },
    });
    expect(a.distances).toEqual({ school: 0 });
    expect(blankAssessment().distances.school).toBeUndefined();
  });
  it("bounds and sanitizes persisted user assessments", () => {
    const a = cleanAssessment({
      extra: -5,
      running: Infinity,
      nights: 999,
      road: "Invented",
      notes: "x".repeat(1200),
      distances: { school: 2.5 },
    });
    expect(a).toMatchObject({
      extra: 0,
      running: null,
      nights: 365,
      road: "Not assessed",
      distances: { school: 2.5 },
    });
    expect(a.notes).toHaveLength(1000);
    expect(cleanAssessment(null)).toEqual(blankAssessment());
  });
});
