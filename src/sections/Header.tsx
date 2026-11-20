import { asset } from "@/lib/asset";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/content";
import { scrollToSection } from "@/lib/smooth-scroll";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Блокировка прокрутки при открытом мобильном меню + закрытие по Esc
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // даём оверлею закрыться, затем скроллим
    setTimeout(() => scrollToSection(id), open ? 80 : 0);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || open
            ? "bg-ink-950/80 backdrop-blur-xl border-b border-gold-500/15"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => go("hero")}
            className="flex min-h-[44px] items-center gap-3 text-left"
            aria-label="Партия Равных Прав — на главную"
          >
            <img
              src={asset("assets/logo.png")}
              alt="Эмблема партии ERP — факел и весы правосудия"
              className="h-11 w-auto object-contain"
            />
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-display text-lg font-bold tracking-wide text-gold-300">
                Партия Равных Прав
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.34em] text-paper-dim">
                ERP · Штат Калифорния
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className="group relative min-h-[44px] px-4 text-sm font-semibold text-paper/85 transition-colors hover:text-gold-300"
              >
                {item.label}
                <span className="absolute inset-x-4 bottom-2 h-px origin-left scale-x-0 bg-gold-400 transition-transform duration-300 group-hover:scale-x-100" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => go("join")}
              className="btn-gold ml-3 min-h-[44px] px-6 text-sm"
            >
              Вступить в партию
            </button>
          </nav>

          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
          >
            <span
              className={`h-px w-6 bg-gold-300 transition-all duration-300 ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-6 bg-gold-300 transition-all duration-300 ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Мобильное полноэкранное меню */}
      {open && (
        <div
          className="fixed inset-0 z-40 flex flex-col bg-ink-950/95 backdrop-blur-2xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Меню сайта"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="hairline absolute inset-x-0 top-[72px]" />
          <nav
            className="flex flex-1 flex-col items-stretch justify-center gap-1 px-8 pt-[72px]"
            aria-label="Мобильная навигация"
          >
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className="reveal is-visible border-b border-gold-500/10 py-4 text-left font-display text-3xl font-semibold text-paper transition-colors hover:text-gold-300"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => go("join")}
              className="btn-gold mt-8 min-h-[52px] px-6 text-base"
            >
              Вступить в партию
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
