import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

const adminPassword = required("ADMIN_PASSWORD");

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  /** Пароль входа в админ-панель (/login). Хранить только в .env, не в коде. */
  adminPassword,
  /** Секрет подписи сессионных cookie. В разработке допускается запасной вариант. */
  sessionSecret: required("APP_SECRET") || (adminPassword ? `dev-${adminPassword}` : ""),
};
