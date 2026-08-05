import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "aura-theme";

export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(KEY, next ? "dark" : "light");
      return next;
    });
  };

  return { dark, toggle };
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { dark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Passa al tema chiaro" : "Passa al tema scuro"}
      className={`inline-flex size-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-all duration-300 hover:text-foreground active:scale-95 ${className}`}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
