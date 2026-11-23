import { useEffect, useState } from "react";
import { scrollToTop } from "@/lib/smooth-scroll";

/** Кнопка «наверх» — появляется после прокрутки */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Вернуться наверх"
      tabIndex={visible ? 0 : -1}
      className={`group fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center border border-gold-500/50 bg-ink-900/90 text-gold-300 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-gold-400 hover:bg-gold-500 hover:text-ink-950 hover:shadow-[0_10px_30px_-8px_oklch(0.66_0.11_73/0.7)] sm:bottom-8 sm:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
        aria-hidden="true"
      >
        <path d="m5 15 7-7 7 7" />
      </svg>
    </button>
  );
}
