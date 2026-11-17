import { z } from "zod";
import { asc, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { DEFAULT_MEMBER_ROLE } from "@contracts/constants";
import { getDb } from "./queries/connection";
import { members } from "../db/schema";
import { DEFAULT_MEMBERS } from "../db/defaults";
import { createRouter, publicQuery, adminQuery } from "./middleware";

const nameSchema = z.string().trim().min(2, "Укажите имя").max(255);
const roleSchema = z.string().trim().max(255).optional();

const normRole = (role?: string) => (role && role.trim() ? role.trim() : DEFAULT_MEMBER_ROLE);

async function nextSortOrder() {
  const [last] = await getDb()
    .select({ v: members.sortOrder })
    .from(members)
    .orderBy(desc(members.sortOrder))
    .limit(1);
  return (last?.v ?? -1) + 1;
}

export const membersRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb().select().from(members).orderBy(asc(members.sortOrder), asc(members.id));
  }),

  create: adminQuery
    .input(z.object({ name: nameSchema, role: roleSchema }))
    .mutation(async ({ input }) => {
      const [result] = await getDb()
        .insert(members)
        .values({ name: input.name, role: normRole(input.role), sortOrder: await nextSortOrder() });
      return { id: Number(result.insertId) };
    }),

  update: adminQuery
    .input(z.object({ id: z.number().int(), name: nameSchema, role: roleSchema }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(members)
        .set({ name: input.name, role: normRole(input.role) })
        .where(eq(members.id, input.id));
      return { ok: true as const };
    }),

  delete: adminQuery.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => {
    await getDb().delete(members).where(eq(members.id, input.id));
    return { ok: true as const };
  }),

  /** Новый порядок: массив id в нужной последовательности */
  reorder: adminQuery
    .input(z.object({ ids: z.array(z.number().int()).min(1).max(500) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await Promise.all(
        input.ids.map((id, i) => db.update(members).set({ sortOrder: i }).where(eq(members.id, id))),
      );
      return { ok: true as const };
    }),

  /** Загрузить стартовый состав — только если таблица пуста */
  seedDefaults: adminQuery.mutation(async () => {
    const db = getDb();
    const existing = await db.select({ id: members.id }).from(members).limit(1);
    if (existing.length > 0) {
      throw new TRPCError({ code: "CONFLICT", message: "Список членов уже не пуст" });
    }
    await db
      .insert(members)
      .values(DEFAULT_MEMBERS.map((m, i) => ({ name: m.name, role: m.role, sortOrder: i })));
    return { inserted: DEFAULT_MEMBERS.length };
  }),
});
