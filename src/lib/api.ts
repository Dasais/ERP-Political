import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { DEFAULT_MEMBER_ROLE } from "./constants";

/* ───────────── Типы ───────────── */

export type Member = { id: number; name: string; role: string; sortOrder: number; createdAt: Date };
export type StatuteChapter = { id: number; title: string; body: string; sortOrder: number };
export type NewsCategory = "report" | "statement" | "announcement";
export type NewsPost = {
  id: number;
  title: string;
  category: NewsCategory;
  body: string;
  createdAt: Date;
};
export type ApplicationStatus = "new" | "reviewed";
export type Application = {
  id: number;
  fullName: string;
  age: number;
  contact: string;
  status: ApplicationStatus;
  createdAt: Date;
};

/* ───────────── Ошибки ───────────── */

type DbError = { message: string; code?: string } | null;

function humanize(e: { message: string; code?: string }): string {
  if (e.code === "42501" || /row-level security|permission denied/i.test(e.message))
    return "Недостаточно прав. Войдите в панель заново.";
  if (e.code === "23514") return "Данные не прошли проверку: проверьте длину и формат полей.";
  if (e.code === "PGRST301" || /jwt/i.test(e.message)) return "Сессия истекла. Войдите заново.";
  if (/failed to fetch|networkerror|load failed/i.test(e.message))
    return "Нет соединения с сервером. Проверьте интернет.";
  return e.message;
}

function check(error: DbError): void {
  if (error) throw new Error(humanize(error));
}

/** Если политика RLS отфильтровала строку, Supabase не вернёт ошибку — проверяем сами */
function assertAffected(data: unknown[] | null, what = "Запись не найдена или недостаточно прав.") {
  if (!data || data.length === 0) throw new Error(what);
}

/* ───────────── Маппинг строк БД ───────────── */

type Row = Record<string, unknown>;

const mapMember = (r: Row): Member => ({
  id: Number(r.id),
  name: String(r.name),
  role: String(r.role),
  sortOrder: Number(r.sort_order),
  createdAt: new Date(String(r.created_at)),
});
const mapChapter = (r: Row): StatuteChapter => ({
  id: Number(r.id),
  title: String(r.title),
  body: String(r.body),
  sortOrder: Number(r.sort_order),
});
const mapNews = (r: Row): NewsPost => ({
  id: Number(r.id),
  title: String(r.title),
  category: r.category as NewsCategory,
  body: String(r.body),
  createdAt: new Date(String(r.created_at)),
});
const mapApplication = (r: Row): Application => ({
  id: Number(r.id),
  fullName: String(r.full_name),
  age: Number(r.age),
  contact: String(r.contact),
  status: r.status as ApplicationStatus,
  createdAt: new Date(String(r.created_at)),
});

const normRole = (role?: string) => (role && role.trim() ? role.trim() : DEFAULT_MEMBER_ROLE);

async function nextSortOrder(table: "members" | "statute_chapters"): Promise<number> {
  const { data, error } = await supabase
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  check(error);
  const last = data?.[0]?.sort_order;
  return (typeof last === "number" ? last : -1) + 1;
}

/* ───────────── Запросы ───────────── */

const QK = {
  news: ["news"],
  members: ["members"],
  statute: ["statute"],
  applications: ["applications"],
} as const;

export const useNewsList = () =>
  useQuery({
    queryKey: QK.news,
    queryFn: async (): Promise<NewsPost[]> => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      check(error);
      return (data ?? []).map(mapNews);
    },
  });

export const useMembersList = () =>
  useQuery({
    queryKey: QK.members,
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });
      check(error);
      return (data ?? []).map(mapMember);
    },
  });

export const useStatuteList = () =>
  useQuery({
    queryKey: QK.statute,
    queryFn: async (): Promise<StatuteChapter[]> => {
      const { data, error } = await supabase
        .from("statute_chapters")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });
      check(error);
      return (data ?? []).map(mapChapter);
    },
  });

export const useApplicationsList = () =>
  useQuery({
    queryKey: QK.applications,
    queryFn: async (): Promise<Application[]> => {
      const { data, error } = await supabase
        .from("join_applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      check(error);
      return (data ?? []).map(mapApplication);
    },
  });

/* ───────────── Мутации ───────────── */

type Opts<TData, TVars> = {
  onSuccess?: (data: TData, vars: TVars) => void | Promise<void>;
  onError?: (err: Error) => void;
};

/** Мутация, которая после успеха сама обновляет нужные списки */
function useApiMutation<TVars, TData = void>(
  fn: (vars: TVars) => Promise<TData>,
  invalidate: readonly (readonly string[])[],
  opts?: Opts<TData, TVars>,
) {
  const qc = useQueryClient();
  return useMutation<TData, Error, TVars>({
    mutationFn: fn,
    onSuccess: async (data, vars) => {
      await Promise.all(invalidate.map((key) => qc.invalidateQueries({ queryKey: [...key] })));
      await opts?.onSuccess?.(data, vars);
    },
    onError: (err) => opts?.onError?.(err),
  });
}

/* Новости */
type NewsInput = { title: string; category: NewsCategory; body: string };

export const useCreateNews = (opts?: Opts<void, NewsInput>) =>
  useApiMutation<NewsInput>(
    async (v) => {
      const { error } = await supabase.from("news_posts").insert(v);
      check(error);
    },
    [QK.news],
    opts,
  );

export const useUpdateNews = (opts?: Opts<void, NewsInput & { id: number }>) =>
  useApiMutation<NewsInput & { id: number }>(
    async ({ id, ...v }) => {
      const { data, error } = await supabase.from("news_posts").update(v).eq("id", id).select("id");
      check(error);
      assertAffected(data);
    },
    [QK.news],
    opts,
  );

export const useDeleteNews = (opts?: Opts<void, { id: number }>) =>
  useApiMutation<{ id: number }>(
    async ({ id }) => {
      const { data, error } = await supabase.from("news_posts").delete().eq("id", id).select("id");
      check(error);
      assertAffected(data);
    },
    [QK.news],
    opts,
  );

/* Члены партии */
type MemberInput = { name: string; role?: string };

export const useCreateMember = (opts?: Opts<void, MemberInput>) =>
  useApiMutation<MemberInput>(
    async (v) => {
      const sort_order = await nextSortOrder("members");
      const { error } = await supabase
        .from("members")
        .insert({ name: v.name.trim(), role: normRole(v.role), sort_order });
      check(error);
    },
    [QK.members],
    opts,
  );

export const useUpdateMember = (opts?: Opts<void, MemberInput & { id: number }>) =>
  useApiMutation<MemberInput & { id: number }>(
    async ({ id, name, role }) => {
      const { data, error } = await supabase
        .from("members")
        .update({ name: name.trim(), role: normRole(role) })
        .eq("id", id)
        .select("id");
      check(error);
      assertAffected(data);
    },
    [QK.members],
    opts,
  );

export const useDeleteMember = (opts?: Opts<void, { id: number }>) =>
  useApiMutation<{ id: number }>(
    async ({ id }) => {
      const { data, error } = await supabase.from("members").delete().eq("id", id).select("id");
      check(error);
      assertAffected(data);
    },
    [QK.members],
    opts,
  );

export const useReorderMembers = (opts?: Opts<void, { ids: number[] }>) =>
  useApiMutation<{ ids: number[] }>(
    async ({ ids }) => {
      const { error } = await supabase.rpc("reorder_members", { ids });
      check(error);
    },
    [QK.members],
    opts,
  );

/* Устав */
type ChapterInput = { title: string; body: string };

export const useCreateChapter = (opts?: Opts<void, ChapterInput>) =>
  useApiMutation<ChapterInput>(
    async (v) => {
      const sort_order = await nextSortOrder("statute_chapters");
      const { error } = await supabase
        .from("statute_chapters")
        .insert({ title: v.title.trim(), body: v.body.trim(), sort_order });
      check(error);
    },
    [QK.statute],
    opts,
  );

export const useUpdateChapter = (opts?: Opts<void, ChapterInput & { id: number }>) =>
  useApiMutation<ChapterInput & { id: number }>(
    async ({ id, title, body }) => {
      const { data, error } = await supabase
        .from("statute_chapters")
        .update({ title: title.trim(), body: body.trim() })
        .eq("id", id)
        .select("id");
      check(error);
      assertAffected(data);
    },
    [QK.statute],
    opts,
  );

export const useDeleteChapter = (opts?: Opts<void, { id: number }>) =>
  useApiMutation<{ id: number }>(
    async ({ id }) => {
      const { data, error } = await supabase
        .from("statute_chapters")
        .delete()
        .eq("id", id)
        .select("id");
      check(error);
      assertAffected(data);
    },
    [QK.statute],
    opts,
  );

export const useReorderChapters = (opts?: Opts<void, { ids: number[] }>) =>
  useApiMutation<{ ids: number[] }>(
    async ({ ids }) => {
      const { error } = await supabase.rpc("reorder_chapters", { ids });
      check(error);
    },
    [QK.statute],
    opts,
  );

/* Заявки на вступление */
export const useSubmitApplication = (
  opts?: Opts<void, { fullName: string; age: number; contact: string }>,
) =>
  useApiMutation<{ fullName: string; age: number; contact: string }>(
    async (v) => {
      const { error } = await supabase
        .from("join_applications")
        .insert({ full_name: v.fullName.trim(), age: v.age, contact: v.contact.trim() });
      check(error);
    },
    [],
    opts,
  );

export const useSetApplicationStatus = (
  opts?: Opts<void, { id: number; status: ApplicationStatus }>,
) =>
  useApiMutation<{ id: number; status: ApplicationStatus }>(
    async ({ id, status }) => {
      const { data, error } = await supabase
        .from("join_applications")
        .update({ status })
        .eq("id", id)
        .select("id");
      check(error);
      assertAffected(data);
    },
    [QK.applications],
    opts,
  );

export const useDeleteApplication = (opts?: Opts<void, { id: number }>) =>
  useApiMutation<{ id: number }>(
    async ({ id }) => {
      const { data, error } = await supabase
        .from("join_applications")
        .delete()
        .eq("id", id)
        .select("id");
      check(error);
      assertAffected(data);
    },
    [QK.applications],
    opts,
  );

/** Принять заявку: добавляет человека в состав и ставит статус «Рассмотрена» (атомарно, в БД) */
export const useAcceptApplication = (opts?: Opts<void, { id: number; role?: string }>) =>
  useApiMutation<{ id: number; role?: string }>(
    async ({ id, role }) => {
      const { error } = await supabase.rpc("accept_application", {
        app_id: id,
        member_role: normRole(role),
      });
      check(error);
    },
    [QK.applications, QK.members],
    opts,
  );
