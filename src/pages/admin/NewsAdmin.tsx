import { useState, type FormEvent } from "react";
import { useNewsList, useCreateNews, useUpdateNews, useDeleteNews } from "@/lib/api";
import { NEWS_CATEGORY_LABELS } from "@/lib/content";
import { field, labelCls, smallBtn, dangerBtn, formatDate, FeedbackLine, type Feedback } from "./shared";

type Category = "report" | "statement" | "announcement";

export default function NewsAdmin() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("report");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);

  const { data: posts, isLoading } = useNewsList();

  const reset = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setCategory("report");
  };

  const onError = (err: { message: string }) =>
    setFeedback({ ok: false, text: err.message || "Не удалось сохранить. Проверьте поля." });

  const create = useCreateNews({
    onSuccess: () => {
      reset();
      setFeedback({ ok: true, text: "Публикация добавлена в ленту новостей." });
    },
    onError,
  });
  const update = useUpdateNews({
    onSuccess: () => {
      reset();
      setFeedback({ ok: true, text: "Изменения сохранены." });
    },
    onError,
  });
  const remove = useDeleteNews({
    onSuccess: (_d, vars) => {
      if (editingId === vars.id) reset();
      setFeedback({ ok: true, text: "Публикация удалена." });
    },
    onError,
  });

  const busy = create.isPending || update.isPending;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (title.trim().length < 3 || body.trim().length < 10) {
      setFeedback({ ok: false, text: "Заголовок (от 3 символов) и текст (от 10 символов) обязательны." });
      return;
    }
    const payload = { title: title.trim(), category, body: body.trim() };
    if (editingId === null) create.mutate(payload);
    else update.mutate({ id: editingId, ...payload });
  };

  const startEdit = (post: NonNullable<typeof posts>[number]) => {
    setFeedback(null);
    setEditingId(post.id);
    setTitle(post.title);
    setCategory(post.category as Category);
    setBody(post.body);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = (id: number, postTitle: string) => {
    if (window.confirm(`Удалить публикацию «${postTitle}»? Это действие нельзя отменить.`)) {
      remove.mutate({ id });
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
      <form onSubmit={submit} className="gold-frame h-fit bg-ink-900 p-6 sm:p-7">
        <h2 className="font-display text-xl font-bold text-paper">
          {editingId === null ? "Новая публикация" : "Редактирование публикации"}
        </h2>
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="adm-title" className={labelCls}>Заголовок</label>
            <input
              id="adm-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Отчёт о митинге…"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="adm-cat" className={labelCls}>Категория</label>
            <select
              id="adm-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={`${field} cursor-pointer appearance-none`}
            >
              {Object.entries(NEWS_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-ink-900">{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="adm-body" className={labelCls}>Текст</label>
            <textarea
              id="adm-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Текст публикации…"
              className={`${field} min-h-[140px] resize-y py-3`}
            />
          </div>
        </div>
        <FeedbackLine feedback={feedback} />
        <div className="mt-5 flex gap-3">
          <button type="submit" disabled={busy} className="btn-gold min-h-[48px] flex-1 text-sm disabled:opacity-60">
            {busy ? "Сохранение…" : editingId === null ? "Опубликовать" : "Сохранить изменения"}
          </button>
          {editingId !== null && (
            <button type="button" onClick={reset} className={smallBtn}>Отмена</button>
          )}
        </div>
      </form>

      <div>
        <h2 className="font-display text-xl font-bold text-paper">Лента ({posts?.length ?? 0})</h2>
        {isLoading ? (
          <p className="mt-4 text-paper-dim">Загрузка…</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {posts?.map((post) => (
              <li
                key={post.id}
                className={`gold-frame bg-ink-900 p-5 ${editingId === post.id ? "ring-1 ring-gold-400" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="border border-gold-500/40 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-gold-300">
                    {NEWS_CATEGORY_LABELS[post.category] ?? post.category}
                  </span>
                  <time className="text-xs text-paper-dim">{formatDate(post.createdAt)}</time>
                </div>
                <p className="mt-3 font-semibold text-paper">{post.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-paper/70">{post.body}</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => startEdit(post)} className={smallBtn}>Изменить</button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(post.id, post.title)}
                    disabled={remove.isPending}
                    className={dangerBtn}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
