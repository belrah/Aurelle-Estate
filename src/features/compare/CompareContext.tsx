import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { Scale, X } from "lucide-react";
import { properties, type Property } from "../../data";
import { MAX_COMPARE, validSelection } from "./model";
import "./compare.css";
const storageKey = "aurelle-compare";
type Comparison = {
  ids: string[];
  replace: (ids: string[]) => void;
  toggle: (id: string) => void;
  message: string;
};
const Context = createContext<Comparison | null>(null);
function initial() {
  try {
    return validSelection(JSON.parse(localStorage.getItem(storageKey) || "[]"));
  } catch {
    return [];
  }
}
export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState(initial),
    [message, setMessage] = useState("");
  const replace = useCallback((next: string[]) => {
    const clean = validSelection(next);
    setIds(clean);
    setMessage("");
    try {
      localStorage.setItem(storageKey, JSON.stringify(clean));
    } catch {
      setMessage(
        "Your shortlist is available for this visit. Browser storage is unavailable.",
      );
    }
  }, []);
  const toggle = (id: string) => {
    if (ids.includes(id)) replace(ids.filter((x) => x !== id));
    else if (ids.length >= MAX_COMPARE)
      setMessage(
        "You can compare up to four listings. Remove one before adding another.",
      );
    else replace([...ids, id]);
  };
  return (
    <Context.Provider value={{ ids, replace, toggle, message }}>
      {children}
    </Context.Provider>
  );
}
export function useComparison() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Comparison requires its provider.");
  return ctx;
}
export function CompareButton({ property }: { property: Property }) {
  const { ids, toggle } = useComparison();
  const selected = ids.includes(property.slug);
  return (
    <button
      className={`compare-toggle ${selected ? "selected" : ""}`}
      aria-pressed={selected}
      aria-label={`${selected ? "Remove" : "Compare"} ${property.title}${selected ? " from comparison" : ""}`}
      onClick={() => toggle(property.slug)}
    >
      <Scale size={15} />
      {selected ? "Added to comparison" : "Compare"}
    </button>
  );
}
export function CompareTray() {
  const { ids, replace, message } = useComparison();
  const { pathname } = useLocation();
  if (!ids.length || pathname.replace(/\/$/, "") === "/compare") return null;
  return (
    <aside className="compare-tray" aria-label="Comparison shortlist">
      <div>
        <strong>
          <Scale size={17} /> Your shortlist · {ids.length}/4
        </strong>
        <span>
          {ids
            .map((id) => properties.find((p) => p.slug === id)!.title)
            .join(" · ")}
        </span>
        {message && <p role="status">{message}</p>}
      </div>
      <Link to="/compare" className="button">
        Compare {ids.length} <span aria-hidden="true">→</span>
      </Link>
      <button
        aria-label="Clear comparison shortlist"
        className="compare-clear"
        onClick={() => replace([])}
      >
        <X size={17} />
      </button>
    </aside>
  );
}
