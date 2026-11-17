import { createHash, timingSafeEqual } from "node:crypto";
import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { env } from "./lib/env";
import { getSessionCookieOptions } from "./lib/cookies";
import { signSessionToken } from "./lib/session";
import { createRouter, publicQuery } from "./middleware";

// ── Защита от подбора пароля: ограничение неудачных попыток по IP ──
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; first: number }>();

function clientIp(headers: Headers): string {
  // Берём последний адрес из X-Forwarded-For: его добавляет ближайший прокси, подделать труднее
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return headers.get("x-real-ip") ?? "unknown";
}

/** Сколько секунд ещё ждать, если IP заблокирован; 0 — можно пробовать */
function lockedForSeconds(ip: string): number {
  const rec = fails.get(ip);
  if (!rec) return 0;
  const elapsed = Date.now() - rec.first;
  if (elapsed > LOCK_MS) {
    fails.delete(ip);
    return 0;
  }
  return rec.count >= MAX_FAILS ? Math.ceil((LOCK_MS - elapsed) / 1000) : 0;
}

function registerFail(ip: string) {
  const rec = fails.get(ip);
  if (!rec || Date.now() - rec.first > LOCK_MS) fails.set(ip, { count: 1, first: Date.now() });
  else rec.count += 1;
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const authRouter = createRouter({
  /** Текущий администратор или null */
  me: publicQuery.query((opts) => opts.ctx.user ?? null),

  login: publicQuery
    .input(z.object({ password: z.string().min(1).max(200) }))
    .mutation(async ({ input, ctx }) => {
      const ip = clientIp(ctx.req.headers);

      const wait = lockedForSeconds(ip);
      if (wait > 0) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Слишком много неверных попыток. Повторите через ${Math.ceil(wait / 60)} мин.`,
        });
      }

      // Пустой ADMIN_PASSWORD на сервере = вход закрыт полностью
      if (!env.adminPassword || !safeEqual(input.password, env.adminPassword)) {
        registerFail(ip);
        await sleep(600);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Неверный пароль" });
      }

      fails.delete(ip);
      const token = await signSessionToken();
      const opts = getSessionCookieOptions(ctx.req);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          ...opts,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );
      return { ok: true as const };
    }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", { ...opts, maxAge: 0 }),
    );
    return { success: true };
  }),
});
