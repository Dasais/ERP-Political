/**
 * Настройки подключения к Supabase.
 * Supabase → Project Settings → API:
 *   - Project URL            → SUPABASE_URL
 *   - anon / publishable key → SUPABASE_ANON_KEY
 * Эти два значения публичные по замыслу Supabase (их видит любой браузер).
 * Защита данных обеспечивается правилами доступа (RLS) из supabase/setup.sql.
 * НИКОГДА не вставляйте сюда service_role / secret key.
 */
export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL ?? "https://YOUR-PROJECT.supabase.co";

export const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? "YOUR-ANON-KEY";

/**
 * Email единственного администратора. Пользователь с этим email создаётся
 * в Supabase (Authentication → Users). На странице входа вводится только пароль.
 */
export const ADMIN_EMAIL: string = import.meta.env.VITE_ADMIN_EMAIL ?? "admin@erp-party.com";
