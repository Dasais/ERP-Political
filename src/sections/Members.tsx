import { trpc } from "@/providers/trpc";
import { HQ_ADDRESS } from "@/lib/content";

export default function Members() {
  const { data: members, isLoading, isError } = trpc.members.list.useQuery();
  const list = members ?? [];

  return (
    <section id="members" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="reveal max-w-3xl">
          <p className="kicker">Открытость и подотчётность</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl">
            Состав и штаб-квартира
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper-dim sm:text-lg">
            Список действующих членов партии публикуется в открытом доступе
            в соответствии с Article 4.2.b Закона «О политических партиях».
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[5fr_7fr] lg:gap-8">
          {/* Штаб-квартира */}
          <div className="gold-frame reveal bg-ink-900 p-8 sm:p-10">
            <p className="kicker">Штаб-квартира Высшего Совета</p>
            <address className="mt-6 space-y-1 not-italic">
              <p className="font-display text-2xl font-bold leading-snug text-paper sm:text-[1.65rem]">
                {HQ_ADDRESS.region}
              </p>
              <p className="font-display text-2xl font-semibold text-gold-300 sm:text-[1.65rem]">
                {HQ_ADDRESS.street}
              </p>
            </address>
            <div className="hairline my-7" />
            <ul className="space-y-3 text-[15px] leading-relaxed text-paper/75 sm:text-base">
              <li className="flex gap-3">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500" aria-hidden="true" />
                Приём граждан — каждая суббота, 12:00–16:00
              </li>
              <li className="flex gap-3">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500" aria-hidden="true" />
                Отчётное собрание Высшего Совета — ежемесячно, открытое посещение
              </li>
              <li className="flex gap-3">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-500" aria-hidden="true" />
                Юридическая приёмная — бесплатные консультации по защите прав
              </li>
            </ul>
          </div>

          {/* Список членов */}
          <div className="reveal" style={{ ["--reveal-delay" as string]: "140ms" }}>
            <div className="gold-frame bg-ink-900">
              <div className="flex items-center justify-between border-b border-gold-500/15 px-7 py-5 sm:px-9">
                <h3 className="font-display text-xl font-bold text-paper sm:text-2xl">
                  Действующие члены партии
                </h3>
                <span className="border border-gold-500/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-300">
                  {list.length} {peopleWord(list.length)}
                </span>
              </div>
              {isLoading && <p className="px-7 py-6 text-paper-dim sm:px-9">Загрузка списка…</p>}
              {isError && (
                <p className="px-7 py-6 text-red-400 sm:px-9">Не удалось загрузить список. Обновите страницу.</p>
              )}
              {members && list.length === 0 && (
                <p className="px-7 py-6 text-paper-dim sm:px-9">Список членов партии пока пуст.</p>
              )}
              <ul>
                {list.map((member, i) => (
                  <li
                    key={member.id}
                    className={`flex items-center justify-between gap-4 px-7 py-4 transition-colors duration-300 hover:bg-gold-500/[0.06] sm:px-9 ${
                      i > 0 ? "border-t border-gold-500/10" : ""
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-paper">{member.name}</p>
                      <p className="mt-0.5 text-sm text-paper-dim">{member.role}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-gold-400">
                      <span className="relative flex h-2 w-2" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
                      </span>
                      Действующий
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {list.length >= 5 && (
              <p className="mt-4 text-sm leading-relaxed text-paper-dim">
                Соответствие минимальному составу из 5 действующих членов подтверждено
                (Article 4.2.b Закона «О политических партиях»).
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function peopleWord(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "человека";
  return "человек";
}
