import type { ReactNode } from "react";

export const field =
  "min-h-[48px] w-full border border-gold-500/20 bg-ink-900 px-4 text-[15px] text-paper placeholder:text-paper-dim/50 transition-colors focus:border-gold-400 focus:outline-none";

export const labelCls = "mb-2 block text-sm font-semibold text-paper/90";

export const smallBtn =
  "min-h-[40px] border border-gold-500/30 px-3 text-xs font-semibold uppercase tracking-[0.1em] text-gold-300 transition-colors hover:border-gold-400 disabled:cursor-not-allowed disabled:opacity-40";

export const dangerBtn =
  "min-h-[40px] border border-red-400/40 px-3 text-xs font-semibold uppercase tracking-[0.1em] text-red-300 transition-colors hover:border-red-400 disabled:opacity-40";

export function formatDate(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export type Feedback = { ok: boolean; text: string } | null;

export function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p className={`mt-4 text-sm ${feedback.ok ? "text-gold-300" : "text-red-400"}`} role="status">
      {feedback.text}
    </p>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-paper-dim">{children}</p>;
}

/** Перестановка элемента списка: возвращает новый массив id */
export function moveId(ids: number[], index: number, dir: -1 | 1): number[] | null {
  const target = index + dir;
  if (target < 0 || target >= ids.length) return null;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
