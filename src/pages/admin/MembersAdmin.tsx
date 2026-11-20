import { useState, type FormEvent } from "react";
import {
  useMembersList,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
  useReorderMembers,
} from "@/lib/api";
import { DEFAULT_MEMBER_ROLE } from "@/lib/constants";
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

export default function MembersAdmin() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);

  const { data: members, isLoading, isError } = useMembersList();
  const list = members ?? [];

  const onError = (err: { message: string }) =>
    setFeedback({ ok: false, text: err.message || "Не удалось выполнить действие." });

  const create = useCreateMember({
    onSuccess: () => {
      setName("");
      setRole("");
      setFeedback({ ok: true, text: "Член партии добавлен." });
    },
    onError,
  });
  const update = useUpdateMember({
    onSuccess: () => {
      setEditingId(null);
      setFeedback({ ok: true, text: "Изменения сохранены." });
    },
    onError,
  });
  const remove = useDeleteMember({
    onSuccess: () => setFeedback({ ok: true, text: "Член партии удалён из списка." }),
    onError,
  });
  const reorder = useReorderMembers({ onError });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (name.trim().length < 2) {
      setFeedback({ ok: false, text: "Укажите имя и фамилию." });
      return;
    }
    create.mutate({ name: name.trim(), role: role.trim() });
  };

  const startEdit = (m: (typeof list)[number]) => {
    setFeedback(null);
    setEditingId(m.id);
    setEditName(m.name);
    setEditRole(m.role);
  };

  const saveEdit = () => {
    if (editingId === null) return;
    if (editName.trim().length < 2) {
      setFeedback({ ok: false, text: "Имя не может быть пустым." });
      return;
    }
    update.mutate({ id: editingId, name: editName.trim(), role: editRole.trim() });
  };

  const clearRole = (m: (typeof list)[number]) => {
    if (window.confirm(`Снять ${m.name} с должности «${m.role}»?`)) {
      update.mutate({ id: m.id, name: m.name, role: DEFAULT_MEMBER_ROLE });
    }
  };

  const confirmDelete = (m: (typeof list)[number]) => {
    if (window.confirm(`Удалить ${m.name} из списка членов партии?`)) {
      remove.mutate({ id: m.id });
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = moveId(list.map((m) => m.id), index, dir);
    if (next) reorder.mutate({ ids: next });
  };

  // Подсказки: уже использованные должности
  const knownRoles = Array.from(new Set([DEFAULT_MEMBER_ROLE, ...list.map((m) => m.role)]));

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
      <form onSubmit={submit} className="gold-frame h-fit bg-ink-900 p-6 sm:p-7">
        <h2 className="font-display text-xl font-bold text-paper">Новый член партии</h2>
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="mem-name" className={labelCls}>Имя и фамилия</label>
            <input
              id="mem-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Джеймс Картер"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="mem-role" className={labelCls}>Должность</label>
            <input
              id="mem-role"
              type="text"
              list="member-roles"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={DEFAULT_MEMBER_ROLE}
              className={field}
            />
            <datalist id="member-roles">
              {knownRoles.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
            <p className="mt-2 text-xs text-paper-dim">
              Можно ввести любую свою должность. Пустое поле — «{DEFAULT_MEMBER_ROLE}».
            </p>
          </div>
        </div>
        <FeedbackLine feedback={feedback} />
        <button
          type="submit"
          disabled={create.isPending}
          className="btn-gold mt-5 min-h-[48px] w-full text-sm disabled:opacity-60"
        >
          {create.isPending ? "Добавление…" : "Добавить в список"}
        </button>
      </form>

      <div>
        <h2 className="font-display text-xl font-bold text-paper">Состав ({list.length})</h2>
        {isLoading && <p className="mt-4 text-paper-dim">Загрузка…</p>}
        {isError && <p className="mt-4 text-red-400">Не удалось загрузить список. Обновите страницу.</p>}
        {members && list.length === 0 && (
          <Empty>Список пуст. Добавьте первого члена партии в форме слева.</Empty>
        )}
        <ul className="mt-4 space-y-3">
          {list.map((m, i) => {
            const isEditing = editingId === m.id;
            return (
              <li key={m.id} className="gold-frame bg-ink-900 p-5">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      aria-label="Имя и фамилия"
                      className={field}
                    />
                    <input
                      type="text"
                      list="member-roles"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      aria-label="Должность"
                      placeholder={DEFAULT_MEMBER_ROLE}
                      className={field}
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={saveEdit} disabled={update.isPending} className={smallBtn}>
                        {update.isPending ? "Сохранение…" : "Сохранить"}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className={smallBtn}>
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-paper">{m.name}</p>
                        <p className="mt-0.5 text-sm text-paper-dim">{m.role}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={i === 0 || reorder.isPending}
                          aria-label={`Поднять выше: ${m.name}`}
                          className={smallBtn}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === list.length - 1 || reorder.isPending}
                          aria-label={`Опустить ниже: ${m.name}`}
                          className={smallBtn}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEdit(m)} className={smallBtn}>
                        Изменить
                      </button>
                      {m.role !== DEFAULT_MEMBER_ROLE && (
                        <button type="button" onClick={() => clearRole(m)} className={smallBtn}>
                          Снять с должности
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => confirmDelete(m)}
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
    </div>
  );
}
