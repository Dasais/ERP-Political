import { trpc } from "@/providers/trpc";
import { NEWS_CATEGORY_LABELS } from "@/lib/content";

const CATEGORY_STYLES: Record<string, string> = {
  report: "border-gold-500/40 text-gold-300",
  statement: "border-red-400/40 text-red-300",
  announcement: "border-paper/30 text-paper/80",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

export default function News() {
  const { data, isLoading, isError, refetch, isFetching } = trpc.news.list.useQuery();

  return (
    <section id="news" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="kicker">Публичный отчёт</p>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl">
              Новости и акции
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper-dim sm:text-lg">
              Репортажи с митингов, официальные претензии к Правительству
              и анонсы предстоящих мероприятий.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex min-h-[44px] items-center gap-2 border border-gold-500/30 px-5 text-sm font-semibold text-gold-300 transition-colors duration-300 hover:border-gold-400 disabled:opacity-50"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={isFetching ? "animate-spin" : ""}
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
            </svg>
            Обновить
          </button>
        </div>

        <div className="reveal mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3" style={{ ["--reveal-delay" as string]: "120ms" }}>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="gold-frame animate-pulse bg-ink-900 p-7">
                <div className="h-4 w-24 bg-ink-800" />
                <div className="mt-5 h-6 w-4/5 bg-ink-800" />
                <div className="mt-3 h-4 w-full bg-ink-800" />
                <div className="mt-2 h-4 w-2/3 bg-ink-800" />
              </div>
            ))}

          {isError && (
            <div className="gold-frame col-span-full bg-ink-900 p-10 text-center">
              <p className="font-display text-2xl font-semibold text-paper">
                Не удалось загрузить ленту новостей
              </p>
              <p className="mt-2 text-paper-dim">Проверьте соединение и повторите попытку.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="btn-gold mt-6 min-h-[48px] px-7 text-sm"
              >
                Повторить загрузку
              </button>
            </div>
          )}

          {data?.length === 0 && (
            <div className="gold-frame col-span-full bg-ink-900 p-10 text-center">
              <p className="font-display text-2xl font-semibold text-paper">Новостей пока нет</p>
              <p className="mt-2 text-paper-dim">Первые публикации появятся в ближайшее время.</p>
            </div>
          )}

          {data?.map((post) => (
            <article key={post.id} className="gold-frame flex flex-col bg-ink-900 p-7">
              <div className="flex items-center justify-between gap-3">
                <time className="text-xs font-semibold uppercase tracking-[0.18em] text-paper-dim" dateTime={new Date(post.createdAt).toISOString()}>
                  {formatDate(post.createdAt)}
                </time>
                <span
                  className={`border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                    CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES.announcement
                  }`}
                >
                  {NEWS_CATEGORY_LABELS[post.category] ?? post.category}
                </span>
              </div>
              <h3 className="mt-5 font-display text-[1.45rem] font-bold leading-snug text-paper">
                {post.title}
              </h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-paper/70">{post.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
