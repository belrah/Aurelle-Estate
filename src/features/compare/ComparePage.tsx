import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Download, Plus, Printer, Share2, X } from "lucide-react";
import { image, properties, type Property } from "../../data";
import { currency } from "../../logic";
import { useComparison } from "./CompareContext";
import {
  amenities,
  blankAssessment,
  budgetTotal,
  cleanAssessment,
  comparable,
  quoteBasis,
  unitPrice,
  validSelection,
  type Assessment,
} from "./model";

const noteKey = "aurelle-comparison-assessments";
function loadNotes(): Record<string, Assessment> {
  try {
    const value = JSON.parse(localStorage.getItem(noteKey) || "{}");
    return Object.fromEntries(
      properties.map((p) => [p.slug, cleanAssessment(value?.[p.slug])]),
    );
  } catch {
    return {};
  }
}
type Row = { label: string; values: string[] };
function rowsFor(items: Property[], notes: Record<string, Assessment>): Row[] {
  const row = (label: string, fn: (p: Property, a: Assessment) => string) => ({
    label,
    values: items.map((p) => fn(p, notes[p.slug] || blankAssessment())),
  });
  return [
    row("Location", (p) => p.location),
    row("Listing type", (p) => p.category + " · " + p.type),
    row(
      "Asking price",
      (p) => currency(p.price) + (p.period ? " " + p.period : " · purchase"),
    ),
    row("Listed area", (p) => `${p.area} m² · area basis unverified`),
    row("Indicative price / m²", (p) =>
      unitPrice(p) === null
        ? "Not available"
        : `${currency(unitPrice(p)!)} / m²${p.period.includes("night") ? " / night" : p.period.includes("year") ? " / year" : ""}`,
    ),
    row("Bedrooms / bathrooms", (p) =>
      p.type === "Land"
        ? "Not applicable"
        : `${p.beds} bedrooms · ${p.baths} bathrooms`,
    ),
    row("Listing status", (p) => p.status + " · sample data"),
    ...amenities.map(([key, label]) =>
      row(`${label} distance`, (_, a) =>
        a.distances[key] === undefined
          ? "Not provided"
          : `${a.distances[key]} km · your input`,
      ),
    ),
    row("Access-road condition", (_, a) =>
      a.road === "Not assessed"
        ? "Not assessed"
        : a.road + " · your observation",
    ),
    row("Power & water", () => "Not verified"),
    row("Drainage & flood risk", () => "Not assessed"),
    row("Title & ownership checks", () => "Documents not provided"),
    row("Land zoning / soil survey", (p) =>
      p.type === "Land" ? "Not provided" : "Confirm if relevant",
    ),
    row("Budget quote", (p, a) =>
      quoteBasis(p) === "night"
        ? `${a.nights} nights`
        : quoteBasis(p) === "year"
          ? "One annual rent payment"
          : "One purchase",
    ),
    row("Extra upfront costs", (_, a) =>
      a.extra === null
        ? "Not estimated (excluded)"
        : currency(a.extra) + " · your estimate",
    ),
    row("Other planned costs", (_, a) =>
      a.running === null
        ? "Not estimated (excluded)"
        : currency(a.running) + " · your estimate",
    ),
    row(
      "Planning subtotal",
      (p, a) =>
        currency(budgetTotal(p, a)) +
        (a.extra === null || a.running === null
          ? " · excludes unentered costs"
          : " · user estimates"),
    ),
    row("Your inspection notes", (_, a) => a.notes || "No notes added"),
  ];
}
function csvCell(value: string) {
  return (
    '"' +
    (/^\s*[=+@-]/.test(value) ? "'" : "") +
    value.replaceAll('"', '""') +
    '"'
  );
}
export default function ComparePage() {
  const { ids, replace, message } = useComparison();
  const [params, setParams] = useSearchParams();
  const incoming = params.get("items");
  const [notes, setNotes] = useState(loadNotes),
    [feedback, setFeedback] = useState(""),
    [differences, setDifferences] = useState(false),
    [pick, setPick] = useState(""),
    [category, setCategory] = useState("All");
  useEffect(() => {
    if (incoming !== null) replace(validSelection(incoming.split(",")));
  }, [incoming, replace]);
  const items = ids.map((id) => properties.find((p) => p.slug === id)!);
  const update = (next: string[]) => {
    replace(next);
    setParams({ items: validSelection(next).join(",") }, { replace: true });
  };
  const edit = (slug: string, patch: Partial<Assessment>) => {
    const next = {
      ...notes,
      [slug]: cleanAssessment({
        ...(notes[slug] || blankAssessment()),
        ...patch,
      }),
    };
    setNotes(next);
    try {
      localStorage.setItem(noteKey, JSON.stringify(next));
      setFeedback("");
    } catch {
      setFeedback(
        "Your notes are available for this visit; browser storage is unavailable.",
      );
    }
  };
  const rows = rowsFor(items, notes),
    likeForLike = comparable(items);
  const lowest = likeForLike ? Math.min(...items.map((p) => p.price)) : null;
  const available = properties.filter(
    (p) =>
      !ids.includes(p.slug) && (category === "All" || p.category === category),
  );
  const share = async () => {
    setParams({ items: ids.join(",") }, { replace: true });
    const url = new URL(
      import.meta.env.BASE_URL + "compare",
      window.location.origin,
    );
    url.searchParams.set("items", ids.join(","));
    try {
      await navigator.clipboard.writeText(url.href);
      setFeedback(
        "Comparison link copied. Only the selected listings are shared; your notes and estimates stay private.",
      );
    } catch {
      setFeedback(
        "Copy is unavailable. Use your browser’s address bar to share the selected listings.",
      );
    }
  };
  const download = () => {
    const content = [
      ["Aurelle Estates · sample listings", ...items.map((p) => p.title)],
      ...rows.map((r) => [r.label, ...r.values]),
      [
        "Notice",
        "User-entered estimates and observations are unverified. Fees, amenities, title and availability require confirmation.",
      ],
    ]
      .map((r) => r.map(csvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "aurelle-property-comparison.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const tableRow = (label: string, values: ReactNode[], className = "") => (
    <tr key={label} className={className}>
      <th scope="row">{label}</th>
      {values.map((v, i) => (
        <td key={items[i].slug}>{v}</td>
      ))}
    </tr>
  );
  return (
    <section className="wrap compare-page">
      <div className="compare-intro">
        <div>
          <p className="eyebrow">A CLEARER VIEW OF YOUR NEXT MOVE</p>
          <h1>A place for every priority.</h1>
          <p>
            Compare homes and land side by side. Look beyond the asking price
            and build a shortlist that fits your plans.
          </p>
        </div>
        <span className="compare-count">{items.length} of 4 listings</span>
      </div>
      <p className="compare-disclosure">
        Demonstration listings. Prices and areas are illustrative. Amenity
        distances, services, legal documents and access conditions have not been
        verified. Add your own observations below; missing information is never
        treated as zero.
      </p>
      <form
        className="compare-add"
        onSubmit={(e) => {
          e.preventDefault();
          if (pick && ids.length < 4) {
            update([...ids, pick]);
            setPick("");
          }
        }}
      >
        <label>
          Listing category
          <select
            aria-label="Listing category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPick("");
            }}
          >
            <option>All</option>
            {[...new Set(properties.map((p) => p.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Add a listing
          <select
            aria-label="Add a listing"
            value={pick}
            onChange={(e) => setPick(e.target.value)}
            disabled={ids.length >= 4}
          >
            <option value="">Choose a home or land</option>
            {available.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title} · {p.location}
              </option>
            ))}
          </select>
        </label>
        <button className="button" disabled={!pick || ids.length >= 4}>
          <Plus size={16} /> Add to comparison
        </button>
      </form>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {!items.length ? (
        <div className="compare-empty">
          <h2>Your next chapter starts with a shortlist.</h2>
          <p>
            Choose up to four listings above, or use the Compare button on any
            property or land card. Add at least two to see their differences.
          </p>
          <Link className="button" to="/properties">
            Explore properties <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="compare-toolbar">
            <label>
              <input
                type="checkbox"
                checked={differences}
                onChange={(e) => setDifferences(e.target.checked)}
                disabled={items.length < 2}
              />{" "}
              Show differences only
            </label>
            <div>
              <button onClick={share} disabled={items.length < 2}>
                <Share2 size={15} /> Share listings
              </button>
              <button onClick={download}>
                <Download size={15} /> Download CSV
              </button>
              <button onClick={() => window.print()}>
                <Printer size={15} /> Print
              </button>
              <button onClick={() => update([])}>Clear shortlist</button>
            </div>
          </div>
          <p className="compare-explainer">
            {items.length < 2
              ? "Add a second listing to compare."
              : likeForLike
                ? "The lowest asking price in this category is highlighted. This is a price comparison, not a valuation or recommendation."
                : "These listings have different categories or payment periods. Purchase prices, annual rents and nightly rates are not ranked against one another."}{" "}
            Price per m² uses the listed area; confirm whether it refers to
            floor area or plot area before relying on it.
          </p>
          {feedback && (
            <p className="notice" role="status">
              {feedback}
            </p>
          )}
          <p className="compare-scroll-hint">
            On a smaller screen, swipe the table sideways to see every listing.
            The criteria stay visible.
          </p>
          <div
            className="comparison-scroll"
            role="region"
            aria-label="Side-by-side property comparison"
            tabIndex={0}
          >
            <table className="comparison-table" data-count={items.length}>
              <caption>
                Property and land comparison · sample data and your own
                observations
              </caption>
              <thead>
                <tr>
                  <th scope="col">What matters to you</th>
                  {items.map((p) => (
                    <th scope="col" key={p.slug}>
                      <div className="comparison-property">
                        <button
                          className="comparison-remove"
                          aria-label={`Remove ${p.title} from comparison`}
                          onClick={() =>
                            update(ids.filter((id) => id !== p.slug))
                          }
                        >
                          <X size={17} />
                        </button>
                        <img
                          src={image(p.photo, 500)}
                          alt={`Illustrative ${p.type.toLowerCase()}`}
                          loading="lazy"
                        />
                        <span className="eyebrow">{p.category}</span>
                        <Link to={`/properties/${p.slug}`}>
                          {p.title}
                          <ArrowUpRight size={14} />
                        </Link>
                        {lowest === p.price && (
                          <span className="comparison-badge">
                            Lowest asking price
                          </span>
                        )}
                        <Link
                          className="comparison-enquire"
                          to={`/contact?property=${encodeURIComponent(p.title)}`}
                        >
                          Enquire about this listing →
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter(
                    (r) =>
                      !differences ||
                      items.length < 2 ||
                      new Set(r.values).size > 1 ||
                      ["Asking price", "Planning subtotal"].includes(r.label),
                  )
                  .map((r) =>
                    tableRow(
                      r.label,
                      r.values,
                      r.label === "Planning subtotal" ? "comparison-total" : "",
                    ),
                  )}
              </tbody>
            </table>
          </div>
          <div className="comparison-notes-heading">
            <p className="eyebrow">YOUR RESEARCH, IN ONE PLACE</p>
            <h2>Build the full picture.</h2>
            <p>
              Add costs, amenity distances and inspection notes from your own
              research. These are your unverified inputs, saved on this browser
              only. Sharing a comparison link shares listing choices only; CSV
              downloads include your estimates and notes.
            </p>
          </div>
          <div className="comparison-assessments">
            {items.map((p) => {
              const a = notes[p.slug] || blankAssessment();
              return (
                <details key={p.slug}>
                  <summary>
                    {p.title}
                    <span>Add costs & observations</span>
                  </summary>
                  <div className="assessment-fields">
                    {quoteBasis(p) === "night" && (
                      <label>
                        Number of nights
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={a.nights}
                          onChange={(e) =>
                            edit(p.slug, { nights: Number(e.target.value) })
                          }
                        />
                      </label>
                    )}
                    <label>
                      Extra upfront costs (₦)
                      <input
                        aria-label="Extra upfront costs (₦)"
                        aria-describedby={`${p.slug}-extra-help`}
                        type="number"
                        min="0"
                        max="1000000000000"
                        value={a.extra ?? ""}
                        placeholder="Not estimated"
                        onChange={(e) =>
                          edit(p.slug, {
                            extra:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                      />
                      <small id={`${p.slug}-extra-help`}>
                        For example, your estimates for legal, survey or agency
                        fees. None are assumed.
                      </small>
                    </label>
                    <label>
                      Other planned costs (₦)
                      <input
                        aria-label="Other planned costs (₦)"
                        aria-describedby={`${p.slug}-other-help`}
                        type="number"
                        min="0"
                        max="1000000000000"
                        value={a.running ?? ""}
                        placeholder="Not estimated"
                        onChange={(e) =>
                          edit(p.slug, {
                            running:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                      />
                      <small id={`${p.slug}-other-help`}>
                        Enter a total for service charges, utilities, repairs or
                        other costs over your chosen planning period.
                      </small>
                    </label>
                    {amenities.map(([key, label]) => (
                      <label key={key}>
                        {label} distance (km)
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          step="0.1"
                          placeholder="Not provided"
                          value={a.distances[key] ?? ""}
                          onChange={(e) => {
                            const distances = { ...a.distances };
                            if (e.target.value === "") delete distances[key];
                            else distances[key] = Number(e.target.value);
                            edit(p.slug, { distances });
                          }}
                        />
                      </label>
                    ))}
                    <label>
                      Access-road condition
                      <select
                        aria-label="Access-road condition"
                        value={a.road}
                        onChange={(e) => edit(p.slug, { road: e.target.value })}
                      >
                        {["Not assessed", "Paved", "Unpaved", "Mixed"].map(
                          (v) => (
                            <option key={v}>{v}</option>
                          ),
                        )}
                      </select>
                    </label>
                    <label className="assessment-notes">
                      Your inspection notes
                      <textarea
                        id={`${p.slug}-inspection-notes`}
                        name={`${p.slug}-inspection-notes`}
                        autoComplete="off"
                        maxLength={1000}
                        rows={3}
                        value={a.notes}
                        placeholder="Check title documents, zoning, flood history, soil, utilities and actual travel routes. Avoid entering personal or financial details."
                        onChange={(e) =>
                          edit(p.slug, { notes: e.target.value })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="assessment-reset"
                      onClick={() => edit(p.slug, blankAssessment())}
                    >
                      Reset this assessment
                    </button>
                    <p className="assessment-subtotal">
                      Planning subtotal:{" "}
                      <strong>{currency(budgetTotal(p, a))}</strong>
                      <small>
                        {quoteBasis(p) === "night"
                          ? `${a.nights} nights`
                          : quoteBasis(p) === "year"
                            ? "One annual rent payment"
                            : "Purchase price"}{" "}
                        + extra upfront costs + other planned costs. Unentered
                        costs are excluded, not confirmed as zero. No fees,
                        taxes, discounts or financing terms are automatically
                        assumed.
                      </small>
                    </p>
                    <a
                      className="text-link"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Explore this area on Maps <ArrowUpRight size={14} />
                    </a>
                    <small>
                      Area search only; this is not a verified property pin or a
                      measured route.
                    </small>
                  </div>
                </details>
              );
            })}
          </div>
          <p className="compare-bottom-note">
            Before making a decision, request a complete fee schedule, inspect
            the location and amenities, and verify title, permitted use, flood
            history and access with the appropriate professionals. Sample
            availability is not a live stock check.
          </p>
        </>
      )}
    </section>
  );
}
