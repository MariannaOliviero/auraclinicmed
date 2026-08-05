import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { to: "/trattamenti", label: "Trattamenti" },
  { to: "/il-dottore", label: "Il Dottore" },
  { to: "/risultati", label: "Risultati" },
  { to: "/testimonianze", label: "Testimonianze" },
  { to: "/magazine", label: "Magazine" },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || open ? "glass-nav" : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="container-aura flex h-16 items-center justify-between">
          <Link to="/" className="text-[1.05rem] font-semibold tracking-[-0.02em]">
            AURA<span className="text-sage"> Clinic</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="relative text-[0.9rem] text-muted-foreground transition-colors duration-300 hover:text-foreground data-[status=active]:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <Button asChild variant="hero" size="sm" className="hidden rounded-full px-5 sm:inline-flex">
              <Link to="/contatti">Prenota</Link>
            </Button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Chiudi menu" : "Apri menu"}
              className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition active:scale-95 md:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 z-40 bg-background pt-24 md:hidden"
          >
            <div className="container-aura flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.05, duration: 0.5, ease: EASE }}
                >
                  <Link to={l.to} className="block border-b border-border/60 py-5 text-2xl font-medium tracking-[-0.02em]">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
                className="mt-8 flex items-center gap-3"
              >
                <Button asChild variant="hero" size="pill" className="flex-1">
                  <Link to="/contatti">Prenota una consulenza</Link>
                </Button>
                <ThemeToggle />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
