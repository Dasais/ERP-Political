import { useState } from "react";
import {
  useApplicationsList,
  useSetApplicationStatus,
  useDeleteApplication,
  useAcceptApplication,
} from "@/lib/api";
import { DEFAULT_MEMBER_ROLE } from "@/lib/constants";
import { smallBtn, dangerBtn, formatDate, FeedbackLine, type Feedback } from "./shared";

export default function ApplicationsAdmin() {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const { data, isLoading, isError } = useApplicationsList();

  const onError = (err: { message: string }) =>
    setFeedback({ ok: false, text: err.message || "Не удалось выполнить действие." });

  const setStatus = useSetApplicationStatus({ onError });
  const remove = useDeleteApplication({
    onSuccess: () => setFeedback({ ok: true, text: "Заявка удалена." }),
    onError,
  });
  const accept = useAcceptApplication({
    onSuccess: () => setFeedback({ ok: true, text: "Заявитель принят и добавлен в список членов партии." }),
    onError,
  });

  const onAccept = (id: number, name: string) => {
    const role = window.prompt(`Должность для ${name}`, DEFAULT_MEMBER_ROLE);
    if (role === null) return;
    accept.mutate({ id, role: role.trim() });
  };

  const onDelete = (id: number, name: string) => {
    if (window.confirm(`Удалить заявку от ${name}?`)) remove.mutate({ id });
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-paper">
        Входящие заявки ({data?.length ?? 0})
      </h2>
      <FeedbackLine feedback={feedback} />
      {isLoading && <p className="mt-4 text-paper-dim">Загрузка…</p>}
      {isError && <p className="mt-4 text-red-400">Не удалось загрузить заявки. Обновите страницу.</p>}
      {data && data.length === 0 && <p className="mt-4 text-paper-dim">Заявок пока не поступало.</p>}
      {data && data.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gold-500/20 text-xs uppercase tracking-[0.14em] text-paper-dim">
                <th className="px-3 py-3 font-semibold">Имя</th>
                <th className="px-3 py-3 font-semibold">Возраст</th>
                <th className="px-3 py-3 font-semibold">Контакт</th>
                <th className="px-3 py-3 font-semibold">Получена</th>
                <th className="px-3 py-3 font-semibold">Статус</th>
                <th className="px-3 py-3 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.map((app) => (
                <tr key={app.id} className="border-b border-gold-500/10 transition-colors hover:bg-gold-500/[0.05]">
                  <td className="px-3 py-3 font-semibold text-paper">{app.fullName}</td>
                  <td className="px-3 py-3 text-paper/80">{app.age}</td>
                  <td className="px-3 py-3 text-paper/80">{app.contact}</td>
                  <td className="px-3 py-3 text-paper-dim">{formatDate(app.createdAt)}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
                        app.status === "new"
                          ? "border-gold-400/60 text-gold-300"
                          : "border-paper/25 text-paper-dim"
                      }`}
                    >
                      {app.status === "new" ? "Новая" : "Рассмотрена"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onAccept(app.id, app.fullName)}
                        disabled={accept.isPending}
                        className={smallBtn}
                      >
                        Принять
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setStatus.mutate({ id: app.id, status: app.status === "new" ? "reviewed" : "new" })
                        }
                        disabled={setStatus.isPending}
                        className={smallBtn}
                      >
                        {app.status === "new" ? "Рассмотрена" : "Вернуть"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(app.id, app.fullName)}
                        disabled={remove.isPending}
                        className={dangerBtn}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
