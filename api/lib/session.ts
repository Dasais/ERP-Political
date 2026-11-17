import { createHash } from "node:crypto";
import * as jose from "jose";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { env } from "./env";

const JWT_ALG = "HS256";

export type SessionUser = { name: string; role: "admin" };

/** Отпечаток пароля: при смене ADMIN_PASSWORD все прежние сессии становятся недействительными */
function passwordFingerprint(): string {
  return createHash("sha256").update(`erp:${env.adminPassword}`).digest("hex").slice(0, 16);
}

export async function signSessionToken(): Promise<string> {
  const secret = new TextEncoder().encode(env.sessionSecret);
  return new jose.SignJWT({ role: "admin", pwv: passwordFingerprint() })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(`${Math.round(Session.maxAgeMs / 1000)}s`)
    .sign(secret);
}

async function verifySessionToken(token: string): Promise<boolean> {
  if (!token || !env.sessionSecret || !env.adminPassword) return false;
  try {
    const secret = new TextEncoder().encode(env.sessionSecret);
    const { payload } = await jose.jwtVerify(token, secret, { algorithms: [JWT_ALG] });
    return payload.role === "admin" && payload.pwv === passwordFingerprint();
  } catch {
    return false;
  }
}

/** Возвращает администратора, если в запросе есть действительная сессия */
export async function authenticateRequest(headers: Headers): Promise<SessionUser | undefined> {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) return undefined;
  const ok = await verifySessionToken(token);
  return ok ? { name: "Администратор", role: "admin" } : undefined;
}
