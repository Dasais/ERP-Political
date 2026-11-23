import { asset } from "@/lib/asset";
import { useParallax } from "@/hooks/useParallax";
import { scrollToSection } from "@/lib/smooth-scroll";
import Embers from "@/components/Embers";

export default function Hero() {
  const bgRef = useParallax<HTMLDivElement>(0.22);

  return (
    <section id="hero" className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      {/* Фон с параллаксом */}
      <div
        ref={bgRef}
        className="absolute inset-[-8%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${asset("assets/hero-bg.jpg")})` }}
        aria-hidden="true"
      />
      {/* Затемнение для читаемости */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,8,0.72) 0%, rgba(8,8,8,0.55) 45%, rgba(8,8,8,0.92) 100%)",
        }}
        aria-hidden="true"
      />
      <Embers />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pb-24 pt-28 text-center sm:px-6">
        <img
          src={asset("assets/logo.png")}
          alt="Эмблема Партии Равных Прав: золотой факел и весы правосудия"
          className="logo-glow reveal is-visible h-36 w-auto object-contain sm:h-44"
        />
        <p className="kicker reveal mt-8">Официальный ресурс партии · Штат Калифорния</p>
        <h1
          className="reveal mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight text-paper sm:text-6xl md:text-7xl"
          style={{ ["--reveal-delay" as string]: "120ms" }}
        >
          Партия Равных Прав
        </h1>
        <p
          className="reveal mt-3 font-display text-2xl font-medium text-gold-400 sm:text-3xl"
          style={{ ["--reveal-delay" as string]: "220ms" }}
        >
          (ERP)
        </p>
        <p
          className="reveal mt-6 max-w-2xl text-lg leading-relaxed text-paper/85 sm:text-xl"
          style={{ ["--reveal-delay" as string]: "320ms" }}
        >
          Равенство перед законом. Контроль над властью. Защита каждого гражданина.
        </p>
        <div className="reveal mt-10" style={{ ["--reveal-delay" as string]: "430ms" }}>
          <button
            type="button"
            onClick={() => scrollToSection("join")}
            className="btn-gold min-h-[52px] px-10 text-base sm:text-lg"
          >
            Вступить в партию
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h14m0 0-6-6m6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Индикатор прокрутки */}
      <button
        type="button"
        onClick={() => scrollToSection("leadership")}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 pb-[env(safe-area-inset-bottom)] text-gold-400/80 transition-colors hover:text-gold-300"
        aria-label="Прокрутить к разделу «Руководство»"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Листайте вниз</span>
        <span className="block h-12 w-px overflow-hidden bg-gold-500/20">
          <span className="scroll-cue-line block h-full w-full bg-gold-400" />
        </span>
      </button>
    </section>
  );
}
