import { useParallax } from "@/hooks/useParallax";
import { PROGRAM_CARDS, type ProgramCard } from "@/lib/content";

function CardIcon({ icon }: { icon: ProgramCard["icon"] }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (icon) {
    case "scales":
      return (
        <svg {...common}>
          <path d="M12 3v18M8 21h8M12 5l7 2M12 5 5 7" />
          <path d="M5 7l-2.6 6a3 3 0 0 0 5.2 0L5 7ZM19 7l-2.6 6a3 3 0 0 0 5.2 0L19 7Z" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.8" />
          <path d="M12 15.5V21" />
        </svg>
      );
    case "hands":
      return (
        <svg {...common}>
          <path d="M12 21c-4.4 0-8-3.2-8-7.2 0-1.6.5-3 1.4-4.2l4.4-5.4c.5-.6 1.5-.6 2 0l1.2 1.5 1.2-1.5c.5-.6 1.5-.6 2 0l4.4 5.4c.9 1.2 1.4 2.6 1.4 4.2 0 4-3.6 7.2-8 7.2Z" />
          <path d="M8.5 12.5 11 15l5-5.5" />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M3 10v4a1 1 0 0 0 1 1h2l3.5 4.2c.4.5 1.2.1 1.2-.6V5.4c0-.7-.8-1.1-1.2-.6L6 9H4a1 1 0 0 0-1 1Z" />
          <path d="M14 8.5a5 5 0 0 1 0 7M17 6a9 9 0 0 1 0 12" />
        </svg>
      );
  }
}

export default function Program() {
  const bgRef = useParallax<HTMLDivElement>(0.16);

  return (
    <section id="program" className="relative overflow-hidden py-24 sm:py-32">
      {/* Фон с параллаксом и сильным затемнением */}
      <div
        ref={bgRef}
        className="absolute inset-[-8%] bg-cover bg-center will-change-transform"
        style={{ backgroundImage: "url(/assets/program-bg.jpg)" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-ink-950/85" aria-hidden="true" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--ink-950) 0%, transparent 18%, transparent 82%, var(--ink-950) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="reveal mx-auto max-w-3xl text-center">
          <p className="kicker">Программа партии</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl">
            Четыре опоры равных прав
          </h2>
          <p className="mt-5 text-base leading-relaxed text-paper-dim sm:text-lg">
            Наша программа коротка и предметна. Мы не обещаем невозможного —
            мы требуем исполнения того, что уже гарантировано Конституцией штата.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {PROGRAM_CARDS.map((card, i) => (
            <article
              key={card.title}
              className="gold-frame reveal group bg-ink-950/55 p-7 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 sm:p-9"
              style={{ ["--reveal-delay" as string]: `${(i % 2) * 120 + Math.floor(i / 2) * 60}ms` }}
            >
              <div className="flex h-14 w-14 items-center justify-center border border-gold-500/40 text-gold-400 transition-colors duration-300 group-hover:border-gold-400 group-hover:text-gold-300">
                <CardIcon icon={card.icon} />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-paper sm:text-[1.7rem]">
                {card.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-paper/75 sm:text-base">
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
