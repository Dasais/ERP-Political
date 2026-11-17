import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import NewsAdmin from "./admin/NewsAdmin";
import MembersAdmin from "./admin/MembersAdmin";
import StatuteAdmin from "./admin/StatuteAdmin";
import ApplicationsAdmin from "./admin/ApplicationsAdmin";

type Tab = "news" | "members" | "statute" | "applications";

const TABS: [Tab, string][] = [
  ["news", "Новости"],
  ["members", "Состав"],
  ["statute", "Устав"],
  ["applications", "Заявки"],
];

export default function Admin() {
  const { user, isLoading, isAuthenticated, logout } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [tab, setTab] = useState<Tab>("news");

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-ink-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" aria-label="Загрузка" />
      </div>
    );
  }

  if (isAuthenticated && user?.role !== "admin") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-ink-950 px-6 text-center">
        <p className="font-display text-3xl font-bold text-paper">Доступ ограничен</p>
        <p className="mt-3 max-w-md text-paper-dim">
          Панель управления доступна только членам Высшего Совета с ролью администратора.
        </p>
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={logout} className="btn-gold min-h-[48px] px-6 text-sm">
            Выйти
          </button>
          <Link
            to="/"
            className="flex min-h-[48px] items-center border border-gold-500/30 px-6 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-ink-950 px-4 py-10 text-paper sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/assets/logo.png" alt="Эмблема партии ERP" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="font-display text-2xl font-bold text-gold-300">Панель управления</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-paper-dim">
                {user?.name ?? "Администратор"} · Высший Совет
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              className="flex min-h-[44px] items-center border border-gold-500/30 px-5 text-sm font-semibold text-gold-300 transition-colors hover:border-gold-400"
            >
              На сайт
            </Link>
            <button type="button" onClick={logout} className="btn-gold min-h-[44px] px-5 text-sm">
              Выйти
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-gold-500/15 sm:gap-2">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={`min-h-[48px] shrink-0 border-b-2 px-4 text-sm sm:px-5 font-semibold transition-colors duration-300 ${
                tab === key
                  ? "border-gold-400 text-gold-300"
                  : "border-transparent text-paper-dim hover:text-paper"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "news" && <NewsAdmin />}
          {tab === "members" && <MembersAdmin />}
          {tab === "statute" && <StatuteAdmin />}
          {tab === "applications" && <ApplicationsAdmin />}
        </div>
      </div>
    </div>
  );
}
