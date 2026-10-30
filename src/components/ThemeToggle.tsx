import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import "../theme.css";
type Theme = "light" | "dark";
const key = "aurelle-theme";
function preference(): Theme | null {
  try {
    const v = localStorage.getItem(key);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}
function system(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0b141e" : "#faf7f2");
}
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => preference() || system());
  const manual = useRef(preference() !== null);
  useEffect(() => {
    apply(theme);
  }, [theme]);
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if (!manual.current) setTheme(media?.matches ? "dark" : "light");
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key && event.key !== null) return;
      const next = preference();
      manual.current = next !== null;
      setTheme(next || system());
    };
    media?.addEventListener?.("change", onSystem);
    window.addEventListener("storage", onStorage);
    return () => {
      media?.removeEventListener?.("change", onSystem);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return (
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Dark mode"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        manual.current = true;
        apply(next);
        setTheme(next);
        try {
          localStorage.setItem(key, next);
        } catch {
          /* Keep the choice for this visit when storage is unavailable. */
        }
      }}
    >
      {theme === "dark" ? (
        <Sun size={19} aria-hidden="true" />
      ) : (
        <Moon size={19} aria-hidden="true" />
      )}
    </button>
  );
}
