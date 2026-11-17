import { useState } from "react";
import { trpc } from "@/providers/trpc";

const toParagraphs = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export default function Statute() {
  const [open, setOpen] = useState<number>(0);
  const { data: chapters, isLoading, isError } = trpc.statute.list.useQuery();

  return (
    <section id="statute" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        <div className="reveal max-w-3xl">
          <p className="kicker">Учредительный документ</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl">
            Устав партии
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper-dim sm:text-lg">
            Полный текст Устава в открытом доступе. Раскройте главу, чтобы прочитать её полностью.
          </p>
        </div>

        <div className="reveal mt-12 border-t border-gold-500/15" style={{ ["--reveal-delay" as string]: "120ms" }}>
          {isLoading && <p className="py-8 text-paper-dim">Загрузка Устава…</p>}
          {isError && <p className="py-8 text-red-400">Не удалось загрузить Устав. Обновите страницу.</p>}
          {chapters && chapters.length === 0 && (
            <p className="py-8 text-paper-dim">Текст Устава скоро будет опубликован.</p>
          )}
          {chapters?.map((chapter, i) => {
            const isOpen = open === i;
            return (
              <div key={chapter.id} className="border-b border-gold-500/15">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={`statute-panel-${i}`}
                    id={`statute-trigger-${i}`}
                    className="group flex min-h-[60px] w-full items-center justify-between gap-4 py-4 text-left sm:min-h-[68px]"
                  >
                    <span
                      className={`font-display text-xl font-semibold transition-colors duration-300 sm:text-2xl ${
                        isOpen ? "text-gold-300" : "text-paper group-hover:text-gold-300"
                      }`}
                    >
                      {chapter.title}
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-all duration-300 ${
                        isOpen
                          ? "rotate-45 border-gold-400 text-gold-300"
                          : "border-gold-500/30 text-paper-dim group-hover:border-gold-400 group-hover:text-gold-300"
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div
                  id={`statute-panel-${i}`}
                  role="region"
                  aria-labelledby={`statute-trigger-${i}`}
                  className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-4 pb-7 pr-2 sm:pr-14">
                      {toParagraphs(chapter.body).map((p, j) => (
                        <p key={j} className="text-[15px] leading-relaxed text-paper/75 sm:text-base">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
