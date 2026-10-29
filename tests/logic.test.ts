import { describe, it, expect } from "vitest";
import {
  mortgage,
  filterProperties,
  currency,
  enquirySchema,
  consentSchema,
  resolveProperty,
} from "../src/logic";
import { properties } from "../src/data";
describe("mortgage estimates", () => {
  it("calculates a fixed payment and pays down the principal", () => {
    const r = mortgage(1000000, 200000, 12, 10, 2000);
    expect(r.monthly).toBeCloseTo(11477.68, 2);
    expect(r.schedule.at(-1)?.balance).toBe(0);
    expect(r.total).toBeCloseTo(r.monthly * 120 + 2000);
  });
  it("handles zero interest", () => {
    const r = mortgage(1200000, 0, 0, 10);
    expect(r.monthly).toBe(10000);
    expect(r.interest).toBe(0);
  });
  it("validates deposits and non-finite values", () => {
    expect(() => mortgage(100, -1, 10, 5)).toThrow();
    expect(() => mortgage(100, 101, 10, 5)).toThrow();
    expect(() => mortgage(NaN, 0, 10, 5)).toThrow();
    expect(() => mortgage(100, 0, 10, 0)).toThrow();
  });
  it("handles full deposit", () =>
    expect(mortgage(100, 100, 5, 5).monthly).toBe(0));
});
describe("property discovery", () => {
  it("treats a zero maximum as a real limit", () =>
    expect(filterProperties(properties, { max: 0 })).toHaveLength(0));
  it("ignores accidental whitespace around locations", () =>
    expect(
      filterProperties(properties, { location: "  Ikoyi  " }),
    ).toHaveLength(1));
  it("filters categories", () =>
    expect(
      filterProperties(properties, { category: "For Rent" }).map((x) => x.slug),
    ).toEqual(["the-ikoyi-retreat"]));
  it("combines price, location and bedrooms", () =>
    expect(
      filterProperties(properties, {
        location: "LEKKI",
        min: 200000000,
        max: 300000000,
        beds: 4,
      }),
    ).toHaveLength(1));
  it("returns empty results when filters conflict", () =>
    expect(
      filterProperties(properties, { category: "Land for Sale", beds: 3 }),
    ).toHaveLength(0));
  it("resolves slugs and formats currency", () => {
    expect(resolveProperty("the-palm-residence")?.beds).toBe(5);
    expect(resolveProperty("missing")).toBeUndefined();
    expect(currency(150000)).toContain("150,000");
  });
});
describe("validation", () => {
  it("rejects phone numbers containing only separators", () =>
    expect(
      enquirySchema.safeParse({
        name: "Ada",
        email: "ada@example.com",
        phone: "-------",
        type: "Rental",
        message: "A complete enquiry for a viewing.",
        method: "Email",
      }).success,
    ).toBe(false));
  it("requires complete enquiry details", () => {
    expect(enquirySchema.safeParse({ name: "A", email: "bad" }).success).toBe(
      false,
    );
    expect(
      enquirySchema.safeParse({
        name: "Ada",
        email: "ada@example.com",
        phone: "08012345678",
        type: "Rental",
        message: "I would like a viewing next week.",
        method: "Email",
      }).success,
    ).toBe(true);
  });
  it("requires explicit agreement consent", () => {
    expect(consentSchema.safeParse(false).success).toBe(false);
    expect(consentSchema.safeParse(true).success).toBe(true);
  });
});
