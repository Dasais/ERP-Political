import { useState } from "react";
import {
  useStatuteList,
  useCreateChapter,
  useUpdateChapter,
  useDeleteChapter,
  useReorderChapters,
} from "@/lib/api";
import {
  field,
  labelCls,
  smallBtn,
  dangerBtn,
  FeedbackLine,
  Empty,
  moveId,
  type Feedback,
} from "./shared";

type Draft = { title: string; body: string };

function ChapterForm({
  initial,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  initial: Draft;
  submitLabel: string;
  pending: boolean;
  onSubmit: (d: Draft) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (title.trim().length < 3 || body.trim().length < 10) {
      setError("Заголовок (от 3 символов) и текст (от 10 символов) обязательны.");
      return;
    }
    setError(null);
    onSubmit({ title: title.trim(), body: body.trim() });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Заголовок главы</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Глава VII. …"
          className={field}
        />
      </div>
      <div>
        <label className={labelCls}>Текст главы</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          className={`${field} min-h-[220px] resize-y py-3 leading-relaxed`}
        />
        <p className="mt-2 text-xs text-paper-dim">Абзацы разделяйте пустой строкой.</p>
      </div>
      {error && <p className="text-sm text-red-400" role="status">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={pending} className="btn-gold min-h-[44px] px-6 text-sm disabled:opacity-60">
          {pending ? "Сохранение…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={smallBtn}>Отмена</button>
        )}
      </div>
    </div>
  );
}

export default function StatuteAdmin() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const { data: chapters, isLoading, isError } = useStatuteList();
  const list = chapters ?? [];

  const onError = (err: { message: string }) =>
    setFeedback({ ok: false, text: err.message || "Не удалось выполнить действие." });

  const create = useCreateChapter({
    onSuccess: () => {
      setAdding(false);
      setFeedback({ ok: true, text: "Глава добавлена в конец Устава." });
    },
    onError,
  });
  const update = useUpdateChapter({
    onSuccess: () => {
      setEditingId(null);
      setFeedback({ ok: true, text: "Глава сохранена." });
    },
    onError,
  });
  const remove = useDeleteChapter({
    onSuccess: () => setFeedback({ ok: true, text: "Глава удалена." }),
    onError,
  });
  const reorder = useReorderChapters({ onError });

  const move = (index: number, dir: -1 | 1) => {
    const next = moveId(list.map((c) => c.id), index, dir);
    if (next) reorder.mutate({ ids: next });
  };

  const confirmDelete = (id: number, title: string) => {
    if (window.confirm(`Удалить главу «${title}»? Это действие нельзя отменить.`)) {
      remove.mutate({ id });
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-paper">Главы Устава ({list.length})</h2>
        {!adding && (
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setEditingId(null);
              setAdding(true);
            }}
            className={smallBtn}
          >
            + Добавить главу
          </button>
        )}
      </div>

      <FeedbackLine feedback={feedback} />

      {adding && (
        <div className="gold-frame mt-4 bg-ink-900 p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-paper">Новая глава</h3>
          <ChapterForm
            initial={{ title: "", body: "" }}
            submitLabel="Добавить главу"
            pending={create.isPending}
            onSubmit={(d) => create.mutate(d)}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {isLoading && <p className="mt-4 text-paper-dim">Загрузка…</p>}
      {isError && <p className="mt-4 text-red-400">Не удалось загрузить Устав. Обновите страницу.</p>}
      {chapters && list.length === 0 && !adding && (
        <Empty>Устав пуст. Нажмите «Добавить главу», чтобы начать.</Empty>
      )}

      <ul className="mt-4 space-y-3">
        {list.map((c, i) => {
          const isEditing = editingId === c.id;
          return (
            <li key={c.id} className="gold-frame bg-ink-900 p-5">
              {isEditing ? (
                <ChapterForm
                  initial={{ title: c.title, body: c.body }}
                  submitLabel="Сохранить главу"
                  pending={update.isPending}
                  onSubmit={(d) => update.mutate({ id: c.id, ...d })}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold text-paper">{c.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-paper/70">{c.body}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0 || reorder.isPending}
                        aria-label={`Поднять выше: ${c.title}`}
                        className={smallBtn}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === list.length - 1 || reorder.isPending}
                        aria-label={`Опустить ниже: ${c.title}`}
                        className={smallBtn}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setAdding(false);
                        setEditingId(c.id);
                      }}
                      className={smallBtn}
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(c.id, c.title)}
                      disabled={remove.isPending}
                      className={dangerBtn}
                    >
                      Удалить
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
