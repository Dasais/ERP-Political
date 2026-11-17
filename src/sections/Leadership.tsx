type Leader = {
  photo: string;
  role: string;
  name: string;
  quote: string;
  alt: string;
};

const LEADERS: Leader[] = [
  {
    photo: "/assets/chairman.jpg",
    role: "Председатель партии",
    name: "Хойт Хантсингер",
    quote:
      "Закон один для всех. Мы заставим Правительство уважать Конституцию и права каждого гражданина.",
    alt: "Портрет Председателя партии Хойта Хантсингера",
  },
  {
    photo: "/assets/deputy.jpg",
    role: "Заместитель Председателя партии",
    name: "Мануэль Кастельяно",
    quote: "Сила общества — в единстве и прямом контроле над властью.",
    alt: "Портрет Заместителя Председателя партии Мануэля Кастельяно",
  },
];

export default function Leadership() {
  return (
    <section id="leadership" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="reveal max-w-3xl">
          <p className="kicker">Высший Совет</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl">
            Руководство партии
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper-dim sm:text-lg">
            Высший Совет избирается открытым голосованием действующих членов партии
            и ежемесячно отчитывается о своей работе перед гражданами штата.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {LEADERS.map((leader, i) => (
            <article
              key={leader.name}
              className="gold-frame reveal group relative overflow-hidden bg-ink-900"
              style={{ ["--reveal-delay" as string]: `${i * 160}ms` }}
            >
              <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/3]">
                <img
                  src={leader.photo}
                  alt={leader.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                {/* Затемнение снизу под текст */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(8,8,8,0) 30%, rgba(8,8,8,0.55) 62%, rgba(8,8,8,0.94) 100%)",
                  }}
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="kicker">{leader.role}</p>
                  <h3 className="mt-2 font-display text-3xl font-bold text-paper sm:text-4xl">
                    {leader.name}
                  </h3>
                  <blockquote className="mt-3 border-l-2 border-gold-500 pl-4 font-display text-lg italic leading-relaxed text-paper/85">
                    «{leader.quote}»
                  </blockquote>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
