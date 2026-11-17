import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { getDb } from "./queries/connection";
import { newsPosts } from "../db/schema";
import { createRouter, publicQuery, adminQuery } from "./middleware";

const postInput = z.object({
  title: z.string().trim().min(3).max(255),
  category: z.enum(["report", "statement", "announcement"]),
  body: z.string().trim().min(10).max(10000),
});

export const newsRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(newsPosts)
      .orderBy(desc(newsPosts.createdAt))
      .limit(50);
  }),

  create: adminQuery.input(postInput).mutation(async ({ input }) => {
    const db = getDb();
    const [result] = await db.insert(newsPosts).values(input);
    return { id: Number(result.insertId) };
  }),

  update: adminQuery
    .input(postInput.extend({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb().update(newsPosts).set(data).where(eq(newsPosts.id, id));
      return { ok: true as const };
    }),

  delete: adminQuery.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => {
    await getDb().delete(newsPosts).where(eq(newsPosts.id, input.id));
    return { ok: true as const };
  }),
});
