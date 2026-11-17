export type SessionCookieOptions = {
  httpOnly: true;
  path: string;
  sameSite: "lax";
  secure: boolean;
};

/** secure ставим только если точно известно, что соединение идёт по HTTPS (иначе на http cookie не сохранится) */
export function getSessionCookieOptions(req: Request): SessionCookieOptions {
  const forwarded = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  let proto = forwarded;
  if (!proto) {
    try {
      proto = new URL(req.url).protocol.replace(":", "");
    } catch {
      proto = "http";
    }
  }
  return { httpOnly: true, path: "/", sameSite: "lax", secure: proto === "https" };
}
