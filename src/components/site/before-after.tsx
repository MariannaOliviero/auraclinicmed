import { useCallback, useEffect, useRef, useState } from "react";

export function BeforeAfter({
  before,
  after,
  alt,
  watermark = "AURA Clinic",
}: {
  before: string;
  after: string;
  alt: string;
  watermark?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (dragging.current) update(e.clientX);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [update]);

  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        dragging.current = true;
        update(e.clientX);
      }}
      className="group relative aspect-[4/5] w-full cursor-ew-resize select-none overflow-hidden rounded-3xl border border-border bg-secondary shadow-[var(--shadow-soft)]"
    >
      <img
        src={after}
        alt={`${alt} — dopo`}
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt={`${alt} — prima`}
          loading="lazy"
          className="absolute inset-0 h-full w-[100vw] max-w-none object-cover"
          style={{ width: ref.current?.clientWidth ?? "100%" }}
          draggable={false}
        />
      </div>

      <div
        className="absolute inset-y-0 w-px bg-background/90 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background/90 px-3 py-2 text-[0.7rem] font-medium backdrop-blur transition-transform duration-300 group-active:scale-95">
          ‹ ›
        </div>
      </div>

      <span className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-[0.7rem] font-medium backdrop-blur">
        Prima
      </span>
      <span className="absolute right-4 top-4 rounded-full bg-background/80 px-3 py-1 text-[0.7rem] font-medium backdrop-blur">
        Dopo
      </span>
      <span className="pointer-events-none absolute bottom-4 right-4 text-[0.7rem] font-medium tracking-wide text-foreground/40">
        {watermark}
      </span>
    </div>
  );
}
