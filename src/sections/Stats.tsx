import { useEffect, useRef, useState } from "react";
import { useMembersList, useNewsList, useStatuteList } from "@/lib/api";

/** Число, плавно «накручивающееся» при появлении на экране */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const run = () => {
      if (reduce) {
        setShown(value);
        return;
      }
      const start = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(Math.round(value * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          run();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    // Данные подгрузились позже, чем счётчик уже проиграл анимацию — просто обновляем значение
    if (started.current) setShown(value);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const members = useMembersList();
  const news = useNewsList();
  const statute = useStatuteList();

  const items = [
    { value: members.data?.length ?? 0, suffix: "", label: "членов партии", ready: !!members.data },
    { value: statute.data?.length ?? 0, suffix: "", label: "глав в открытом Уставе", ready: !!statute.data },
    { value: news.data?.length ?? 0, suffix: "", label: "публикаций в ленте", ready: !!news.data },
    { value: 18, suffix: "+", label: "возраст для вступления", ready: true },
  ];

  return (
    <section aria-label="Партия в цифрах" className="relative -mt-px border-y border-gold-500/15 bg-ink-900/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4 lg:px-10">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`reveal relative px-2 py-9 text-center sm:py-12 ${
              i % 2 === 1 ? "border-l border-gold-500/15" : ""
            } ${i > 0 ? "md:border-l md:border-gold-500/15" : ""} ${i >= 2 ? "border-t border-gold-500/15 md:border-t-0" : ""}`}
            style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
          >
            <p className="font-display text-5xl font-bold tabular-nums text-gold-300 sm:text-6xl">
              {item.ready ? <Counter value={item.value} suffix={item.suffix} /> : "—"}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-paper-dim">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
