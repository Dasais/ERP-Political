import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { DEFAULT_MEMBER_ROLE } from "@contracts/constants";
import { getDb } from "./queries/connection";
import { joinApplications, members } from "../db/schema";
import { createRouter, publicQuery, adminQuery } from "./middleware";

export const applicationsRouter = createRouter({
  submit: publicQuery
    .input(
      z.object({
        fullName: z.string().min(3).max(255),
        age: z.coerce
          .number()
          .int("Укажите возраст целым числом")
          .min(18, "Вступление в партию возможно только с 18 лет")
          .max(120, "Проверьте указанный возраст"),
        contact: z.string().min(3).max(255),
        noOtherParty: z.literal(true, {
          error: "Необходимо подтвердить отсутствие членства в других партиях",
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(joinApplications).values({
        fullName: input.fullName.trim(),
        age: input.age,
        contact: input.contact.trim(),
      });
      return { ok: true as const };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(joinApplications)
      .orderBy(desc(joinApplications.createdAt))
      .limit(200);
  }),

  setStatus: adminQuery
    .input(z.object({ id: z.number().int(), status: z.enum(["new", "reviewed"]) }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(joinApplications)
        .set({ status: input.status })
        .where(eq(joinApplications.id, input.id));
      return { ok: true as const };
    }),

  delete: adminQuery.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => {
    await getDb().delete(joinApplications).where(eq(joinApplications.id, input.id));
    return { ok: true as const };
  }),

  /** Принять заявку: добавить человека в состав и пометить заявку рассмотренной */
  accept: adminQuery
    .input(z.object({ id: z.number().int(), role: z.string().trim().max(255).optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [app] = await db
        .select()
        .from(joinApplications)
        .where(eq(joinApplications.id, input.id))
        .limit(1);
      if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "Заявка не найдена" });

      const [last] = await db
        .select({ v: members.sortOrder })
        .from(members)
        .orderBy(desc(members.sortOrder))
        .limit(1);
      await db.insert(members).values({
        name: app.fullName,
        role: input.role || DEFAULT_MEMBER_ROLE,
        sortOrder: (last?.v ?? -1) + 1,
      });
      await db
        .update(joinApplications)
        .set({ status: "reviewed" })
        .where(eq(joinApplications.id, input.id));
      return { ok: true as const };
    }),
});
