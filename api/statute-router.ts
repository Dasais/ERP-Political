import { z } from "zod";
import { asc, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "./queries/connection";
import { statuteChapters } from "../db/schema";
import { DEFAULT_STATUTE } from "../db/defaults";
import { createRouter, publicQuery, adminQuery } from "./middleware";

const chapterInput = z.object({
  title: z.string().trim().min(3, "Заголовок от 3 символов").max(255),
  body: z.string().trim().min(10, "Текст главы от 10 символов").max(20000),
});

export const statuteRouter = createRouter({
  list: publicQuery.query(async () => {
    return getDb()
      .select()
      .from(statuteChapters)
      .orderBy(asc(statuteChapters.sortOrder), asc(statuteChapters.id));
  }),

  create: adminQuery.input(chapterInput).mutation(async ({ input }) => {
    const db = getDb();
    const [last] = await db
      .select({ v: statuteChapters.sortOrder })
      .from(statuteChapters)
      .orderBy(desc(statuteChapters.sortOrder))
      .limit(1);
    const [result] = await db
      .insert(statuteChapters)
      .values({ ...input, sortOrder: (last?.v ?? -1) + 1 });
    return { id: Number(result.insertId) };
  }),

  update: adminQuery
    .input(chapterInput.extend({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb().update(statuteChapters).set(data).where(eq(statuteChapters.id, id));
      return { ok: true as const };
    }),

  delete: adminQuery.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => {
    await getDb().delete(statuteChapters).where(eq(statuteChapters.id, input.id));
    return { ok: true as const };
  }),

  reorder: adminQuery
    .input(z.object({ ids: z.array(z.number().int()).min(1).max(500) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await Promise.all(
        input.ids.map((id, i) =>
          db.update(statuteChapters).set({ sortOrder: i }).where(eq(statuteChapters.id, id)),
        ),
      );
      return { ok: true as const };
    }),

  /** Загрузить стандартный текст Устава — только если таблица пуста */
  seedDefaults: adminQuery.mutation(async () => {
    const db = getDb();
    const existing = await db.select({ id: statuteChapters.id }).from(statuteChapters).limit(1);
    if (existing.length > 0) {
      throw new TRPCError({ code: "CONFLICT", message: "Устав уже содержит главы" });
    }
    await db.insert(statuteChapters).values(
      DEFAULT_STATUTE.map((c, i) => ({
        title: c.title,
        body: c.paragraphs.join("\n\n"),
        sortOrder: i,
      })),
    );
    return { inserted: DEFAULT_STATUTE.length };
  }),
});
