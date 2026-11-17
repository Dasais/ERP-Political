import { Link } from "react-router";
import { NAV_ITEMS, HQ_ADDRESS } from "@/lib/content";
import { scrollToSection } from "@/lib/smooth-scroll";

export default function Footer() {
  return (
    <footer className="relative border-t border-gold-500/15 bg-ink-950 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[5fr_4fr_3fr]">
          <div>
            <div className="flex items-center gap-4">
              <img
                src="/assets/logo.png"
                alt="Эмблема партии ERP — факел и весы правосудия"
                className="h-16 w-auto object-contain"
              />
              <div>
                <p className="font-display text-xl font-bold text-gold-300">Партия Равных Прав</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.34em] text-paper-dim">
                  ERP · Est. Калифорния
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper-dim">
              Добровольное объединение граждан штата Калифорния за равенство
              перед законом, подотчётность власти и защиту прав каждого гражданина.
            </p>
          </div>

          <div>
            <p className="kicker">Навигация</p>
            <nav className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1" aria-label="Навигация в подвале">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="min-h-[44px] py-2 text-left text-sm font-semibold text-paper/80 transition-colors hover:text-gold-300"
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => scrollToSection("join")}
                className="min-h-[44px] py-2 text-left text-sm font-semibold text-gold-300 transition-colors hover:text-gold-200"
              >
                Вступить в партию
              </button>
            </nav>
          </div>

          <div>
            <p className="kicker">Штаб-квартира</p>
            <address className="mt-5 space-y-1 text-sm leading-relaxed text-paper/80 not-italic">
              <p>{HQ_ADDRESS.region}</p>
              <p className="text-gold-300">{HQ_ADDRESS.street}</p>
              <p className="pt-2 text-paper-dim">Приём граждан: суббота, 12:00–16:00</p>
            </address>
            <Link
              to="/admin"
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-paper-dim transition-colors hover:text-gold-300"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="10" width="16" height="10" rx="1" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Панель управления
            </Link>
          </div>
        </div>

        <div className="hairline mt-14" />
        <div className="mt-7 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="max-w-xl text-xs leading-relaxed text-paper-dim">
            Официальный информационный ресурс Политической партии
            «Партия Равных Прав» (штат Калифорния)
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500/70">
            Равенство · Контроль · Защита
          </p>
        </div>
      </div>
    </footer>
  );
}
