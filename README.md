# Партия Равных Прав — сайт

Статический сайт (React + Vite), который работает на **GitHub Pages**.
Данные (состав, Устав, новости, заявки) и вход в админ-панель — в **Supabase**.

Сайт: `https://<ваш-логин>.github.io/ERP-Political/`
Админ-панель: `https://<ваш-логин>.github.io/ERP-Political/login`

---

## Настройка (один раз)

### 1. Supabase: создать администратора
1. Откройте проект в [supabase.com](https://supabase.com) → **Authentication → Users**.
2. **Add user → Create new user**.
   - Email: `admin@erp-party.com` (можно другой, но тогда поменяйте его ещё в двух местах — см. ниже)
   - Password: ваш пароль для входа в панель
   - Включите **Auto Confirm User**.
3. **Authentication → Sign In / Providers** (или Settings): выключите **Allow new users to sign up**.

### 2. Supabase: создать таблицы
1. **SQL Editor → New query**.
2. Вставьте весь файл `supabase/setup.sql` и нажмите **Run**.
3. В конце должна вернуться одна строка с вашим email. Если пусто — вы не создали пользователя
   (шаг 1) или email не совпадает: исправьте и запустите скрипт ещё раз (он безопасен при повторе).

Скрипт создаёт таблицы, правила доступа (RLS) и загружает текущий состав, Устав и новости.

### 3. Подключить сайт к Supabase
В Supabase: **Project Settings → API**. Скопируйте:
- **Project URL**
- **anon / publishable key** (публичный ключ)

Вставьте их в файл `src/config.ts` (`SUPABASE_URL` и `SUPABASE_ANON_KEY`).
Эти значения публичные, их можно хранить в репозитории. **Никогда не вставляйте** `service_role` / `secret` ключ.

Если использовали другой email администратора — поменяйте `ADMIN_EMAIL` в `src/config.ts`
и `where email = '...'` в конце `supabase/setup.sql`.

### 4. GitHub Pages
1. Загрузите все файлы проекта в репозиторий (ветка `main`), **включая папку `.github`**.
2. Репозиторий → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Вкладка **Actions**: дождитесь зелёной галочки у «Deploy to GitHub Pages» (1–2 минуты).

Каждый следующий `push` в `main` публикует сайт автоматически.

> Сайт настроен на работу с собственным доменом (корень сайта). Если захотите вернуться на адрес вида
> `https://<логин>.github.io/ERP-Political/`, поставьте `base: "/ERP-Political/"` в `vite.config.ts`.

---

## Как менять данные
Откройте `/login`, введите пароль. В панели: **Новости, Состав, Устав, Заявки**.
Изменения сразу видны на сайте, пересобирать ничего не нужно.

## Смена пароля администратора
Supabase → SQL Editor:

```sql
update auth.users
set encrypted_password = extensions.crypt('НОВЫЙ_ПАРОЛЬ', extensions.gen_salt('bf'))
where email = 'admin@erp-party.com';
```

## Локальный запуск
```
npm install
npm run dev
```
Откройте http://localhost:3000/. Значения Supabase берутся из `src/config.ts`
или из файла `.env` (образец — `.env.example`).

## Безопасность
- Читать Состав, Устав и Новости может любой посетитель, менять — только администратор (правила RLS в БД).
- Заявки на вступление любой может отправить, но читать, менять и удалять их может только администратор.
- Даже если кто-то зарегистрируется в Supabase Auth, прав на изменения у него не будет: они выдаются
  только пользователям из таблицы `admins`.
