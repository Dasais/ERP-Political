import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNewsList, type NewsPost } from "@/lib/api";
import { NEWS_CATEGORY_LABELS } from "@/lib/content";

const CATEGORY_STYLES: Record<string, string> = {
  report: "border-gold-500/40 text-gold-300",
  statement: "border-red-400/40 text-red-300",
  announcement: "border-paper/30 text-paper/80",
};

const COLLAPSED_PX = 132; // высота свёрнутого текста (около 5 строк)
const NEW_DAYS = 7;

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}

/** Маркеры «•» посреди строки переносим на новые строки — списки читаются легче */
function formatBody(body: string) {
  return body.replace(/[ \t]+•[ \t]*/g, "\n• ").replace(/^\n/, "");
}

function isFresh(d: Date) {
  return Date.now() - new Date(d).getTime() < NEW_DAYS * 24 * 60 * 60 * 1000;
}

function NewsCard({ post }: { post: NewsPost }) {
  const [open, setOpen] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const [canExpand, setCanExpand] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const text = useMemo(() => formatBody(post.body), [post.body]);
  const bodyId = `news-body-${post.id}`;

  // Измеряем полный текст: если он короткий, кнопка «Читать полностью» не нужна
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const measure = () => {
      setFullHeight(el.scrollHeight);
      setCanExpand(el.scrollHeight > COLLAPSED_PX + 12);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  const collapsed = canExpand && !open;

  return (
    <article className="gold-frame spotlight flex flex-col self-start bg-ink-900 p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <time
            className="text-xs font-semibold uppercase tracking-[0.18em] text-paper-dim"
            dateTime={new Date(post.createdAt).toISOString()}
          >
            {formatDate(post.createdAt)}
          </time>
          {isFresh(post.createdAt) && (
            <span className="news-new rounded-sm bg-gold-500 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-950">
              Новое
            </span>
          )}
        </div>
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

      <div className="relative mt-3">
        <div
          id={bodyId}
          ref={bodyRef}
          className="overflow-hidden whitespace-pre-line break-words text-[15px] leading-relaxed text-paper/70 transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{
            maxHeight: canExpand ? (open ? fullHeight : COLLAPSED_PX) : undefined,
          }}
        >
          {text}
        </div>
        {/* Плавное затухание под свёрнутым текстом */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-900 to-transparent transition-opacity duration-300 ${
            collapsed ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {canExpand && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="group mt-4 flex min-h-[44px] items-center gap-2 self-start text-sm font-bold text-gold-300 transition-colors hover:text-paper"
        >
          {open ? "Свернуть" : "Читать полностью"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 group-hover:translate-y-0.5 ${open ? "rotate-180 group-hover:-translate-y-0.5" : ""}`}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    </article>
  );
}

type Filter = "all" | "report" | "statement" | "announcement";

export default function News() {
  const { data, isLoading, isError, refetch, isFetching } = useNewsList();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data?.length ?? 0, report: 0, statement: 0, announcement: 0 };
    data?.forEach((p) => {
      c[p.category] = (c[p.category] ?? 0) + 1;
    });
    return c;
  }, [data]);

  // Если выбранная категория опустела (например, после удаления новостей) — возвращаем «Все»
  useEffect(() => {
    if (filter !== "all" && data && counts[filter] === 0) setFilter("all");
  }, [filter, data, counts]);

  const visible = data?.filter((p) => filter === "all" || p.category === filter) ?? [];

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "report", label: NEWS_CATEGORY_LABELS.report ?? "Отчёты" },
    { key: "statement", label: NEWS_CATEGORY_LABELS.statement ?? "Заявления" },
    { key: "announcement", label: NEWS_CATEGORY_LABELS.announcement ?? "Анонсы" },
  ];

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

        {/* Фильтр по категориям */}
        {data && data.length > 0 && (
          <div className="reveal mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Категории новостей">
            {chips.map((chip) => {
              const active = filter === chip.key;
              const disabled = chip.key !== "all" && counts[chip.key] === 0;
              return (
                <button
                  key={chip.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => setFilter(chip.key)}
                  className={`flex min-h-[40px] items-center gap-2 border px-4 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 ${
                    active
                      ? "border-gold-400 bg-gold-500 text-ink-950"
                      : "border-gold-500/30 text-paper/80 hover:border-gold-400 hover:text-gold-300"
                  }`}
                >
                  {chip.label}
                  <span
                    className={`rounded-sm px-1.5 text-xs font-bold ${
                      active ? "bg-ink-950/20 text-ink-950" : "bg-ink-800 text-paper-dim"
                    }`}
                  >
                    {counts[chip.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div
          className="reveal mt-8 grid items-start gap-5 md:grid-cols-2 lg:grid-cols-3"
          style={{ ["--reveal-delay" as string]: "120ms" }}
        >
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

          {visible.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
