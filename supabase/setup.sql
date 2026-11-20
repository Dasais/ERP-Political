-- ════════════════════════════════════════════════════════════════════
--  Партия Равных Прав — настройка базы Supabase
--  Как запустить: Supabase → SQL Editor → New query → вставить весь файл → Run.
--  Скрипт можно запускать повторно: он ничего не ломает и не дублирует данные.
--
--  ВАЖНО: перед запуском создайте администратора в Authentication → Users
--  (Add user → Create new user, email и пароль, галочка Auto Confirm User).
--  Email должен совпадать с тем, что указан в самом конце файла
--  и в src/config.ts (ADMIN_EMAIL).
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Администраторы ───────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
-- RLS включён, политик нет → таблица недоступна через API вообще
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── 2. Таблицы ──────────────────────────────────────────────────────
create table if not exists public.members (
  id          bigint generated always as identity primary key,
  name        text not null check (char_length(btrim(name)) between 2 and 255),
  role        text not null default 'Член партии' check (char_length(role) <= 255),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.statute_chapters (
  id          bigint generated always as identity primary key,
  title       text not null check (char_length(btrim(title)) between 3 and 255),
  body        text not null check (char_length(btrim(body)) between 10 and 20000),
  sort_order  integer not null default 0
);

create table if not exists public.news_posts (
  id          bigint generated always as identity primary key,
  title       text not null check (char_length(btrim(title)) between 3 and 255),
  category    text not null check (category in ('report', 'statement', 'announcement')),
  body        text not null check (char_length(btrim(body)) between 10 and 10000),
  created_at  timestamptz not null default now()
);

create table if not exists public.join_applications (
  id          bigint generated always as identity primary key,
  full_name   text not null check (char_length(btrim(full_name)) between 3 and 255),
  age         integer not null check (age between 18 and 120),
  contact     text not null check (char_length(btrim(contact)) between 3 and 255),
  status      text not null default 'new' check (status in ('new', 'reviewed')),
  created_at  timestamptz not null default now()
);

-- ── 3. Правила доступа (RLS) ────────────────────────────────────────
alter table public.members           enable row level security;
alter table public.statute_chapters  enable row level security;
alter table public.news_posts        enable row level security;
alter table public.join_applications enable row level security;

-- Состав, Устав, Новости: читать может любой посетитель, менять — только админ
drop policy if exists "members read"  on public.members;
drop policy if exists "members admin" on public.members;
create policy "members read"  on public.members for select to anon, authenticated using (true);
create policy "members admin" on public.members for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "statute read"  on public.statute_chapters;
drop policy if exists "statute admin" on public.statute_chapters;
create policy "statute read"  on public.statute_chapters for select to anon, authenticated using (true);
create policy "statute admin" on public.statute_chapters for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "news read"  on public.news_posts;
drop policy if exists "news admin" on public.news_posts;
create policy "news read"  on public.news_posts for select to anon, authenticated using (true);
create policy "news admin" on public.news_posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Заявки: подать может любой (только со статусом «new»), читать и менять — только админ
drop policy if exists "applications submit" on public.join_applications;
drop policy if exists "applications admin"  on public.join_applications;
create policy "applications submit" on public.join_applications for insert
  to anon, authenticated with check (status = 'new');
create policy "applications admin" on public.join_applications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── 4. Функции (работают с правами вызывающего, то есть под защитой RLS) ──
create or replace function public.reorder_members(ids bigint[])
returns void
language sql
as $$
  update public.members m
     set sort_order = (t.ord - 1)::integer
    from unnest(ids) with ordinality as t(id, ord)
   where m.id = t.id;
$$;

create or replace function public.reorder_chapters(ids bigint[])
returns void
language sql
as $$
  update public.statute_chapters c
     set sort_order = (t.ord - 1)::integer
    from unnest(ids) with ordinality as t(id, ord)
   where c.id = t.id;
$$;

create or replace function public.accept_application(app_id bigint, member_role text default 'Член партии')
returns void
language plpgsql
as $$
declare
  n text;
begin
  select full_name into n from public.join_applications where id = app_id;
  if n is null then
    raise exception 'Заявка не найдена или недостаточно прав';
  end if;

  insert into public.members (name, role, sort_order)
  values (
    n,
    coalesce(nullif(btrim(member_role), ''), 'Член партии'),
    coalesce((select max(sort_order) + 1 from public.members), 0)
  );

  update public.join_applications set status = 'reviewed' where id = app_id;
end;
$$;

-- ── 5. Начальное наполнение ─────────────────────────────────────────

-- ── Стартовые данные (вставляются только в пустые таблицы) ─────────────

insert into public.members (name, role, sort_order)
select v.name, v.role, v.ord from (values
  ($q$Хойт Хантсингер$q$, $q$Председатель партии$q$, 0),
  ($q$Мануэль Кастельяно$q$, $q$Заместитель Председателя$q$, 1),
  ($q$Елена Маркс$q$, $q$Координатор юридического комитета$q$, 2),
  ($q$Дэниел Роуз$q$, $q$Пресс-секретарь Высшего Совета$q$, 3),
  ($q$София Линдгрен$q$, $q$Координатор мобилизации$q$, 4),
  ($q$Аарон Велес$q$, $q$Казначей партии$q$, 5)
) as v(name, role, ord)
where not exists (select 1 from public.members);

insert into public.statute_chapters (title, body, sort_order)
select v.title, v.body, v.ord from (values
  ($q$Глава I. Общие положения$q$, $q$Политическая партия «Партия Равных Прав» (сокращённое наименование — ПРП, ERP) является добровольным объединением граждан штата Калифорния, созданным для участия в политической жизни, защиты гражданских прав и обеспечения подотчётности органов власти.

Партия действует на основании Конституции и законодательства штата, в том числе в соответствии с Article 4 Закона «О политических партиях», и ведёт свою деятельность открыто и публично.

Официальный информационный ресурс партии — настоящий сайт. Публикация устава, состава руководящих органов и новостей является обязанностью партии, а не её доброй волей.$q$, 0),
  ($q$Глава II. Цели и задачи$q$, $q$Главная цель партии — равенство каждого гражданина перед законом и реальный контроль общества над Правительством.

Для достижения цели партия: добивается строгого исполнения Article 10.2 Конституции, гарантирующей равные права без дискриминации; требует публикации протоколов заседаний и отчётов о расходовании бюджета; защищает право граждан на мирные собрания, митинги и петиции; оказывает бесплатную правовую помощь гражданам, чьи права нарушены.$q$, 1),
  ($q$Глава III. Членство в партии$q$, $q$Членом партии может стать любой гражданин штата, достигший 18-летнего возраста, не состоящий в составе других политических партий, признающий настоящий Устав и подавший заявку через официальную форму на сайте партии.

Приём заявок и учёт членов ведёт Высший Совет партии. Решение о приёме принимается в течение 7 дней с момента подачи заявки.

Членство прекращается по заявлению члена, при вступлении в другую политическую партию либо при грубом нарушении настоящего Устава. Решение об исключении принимает Высший Совет и подлежит публикации.$q$, 2),
  ($q$Глава IV. Органы управления$q$, $q$Высшим руководящим органом партии является Высший Совет во главе с Председателем партии. В состав Совета входят Председатель, его Заместитель и координаторы направлений.

Высший Совет избирается открытым голосованием действующих членов партии сроком на один год и ежемесячно публикует отчёт о своей работе на сайте партии.

Штаб-квартира Высшего Совета расположена по адресу: штат Калифорния, район Flint, ул. Angel Crest Way, дом 3019.$q$, 3),
  ($q$Глава V. Символика и финансы$q$, $q$Официальной эмблемой партии является золотой факел и весы правосудия с надписью «ERP» на тёмном фоне. Использование символики не связано с членством — каждый, кто разделяет цели партии, вправе его использовать.

Источниками финансирования партии являются членские взносы и добровольные пожертвования граждан. Отчёт о поступлениях и расходах публикуется ежеквартально.$q$, 4),
  ($q$Глава VI. Внесение изменений и прекращение деятельности$q$, $q$Изменения и дополнения в настоящий Устав вносятся решением Высшего Совета и утверждаются открытым голосованием действующих членов партии.

Прекращение деятельности партии возможно только по решению общего собрания членов партии. При ликвидации архивы партии передаются в открытый доступ на сайте.$q$, 5)
) as v(title, body, ord)
where not exists (select 1 from public.statute_chapters);

insert into public.news_posts (title, category, body, created_at)
select v.title, v.category, v.body, v.at::timestamptz from (values
  ($q$Митинг у здания Правительства: требуем отчёта по бюджету$q$, $q$report$q$, $q$Состоялся мирный митинг Партии Равных Прав у здания Правительства штата. Председатель Хойт Хантсингер потребовал публичного отчёта о расходовании бюджета и напомнил, что власть обязана отчитываться перед народом ежеквартально. К мероприятию присоединились жители района Flint и активисты партийных ячеек.$q$, $q$2026-11-12T19:30:00Z$q$),
  ($q$Официальная претензия Правительству штата$q$, $q$statement$q$, $q$Высший Совет партии направил Правительству официальную претензию в связи с отказом публиковать протоколы закрытых заседаний. Мы требуем немедленного раскрытия документов в соответствии с принципом подотчётности власти народу. Ответ ожидается в течение 14 дней.$q$, $q$2026-11-08T15:00:00Z$q$),
  ($q$Анонс: отчётное собрание Высшего Совета$q$, $q$announcement$q$, $q$15 ноября в штаб-квартире партии (район Flint, ул. Angel Crest Way, д. 3019) состоится отчётное собрание Высшего Совета. На повестке: итоги митинговой кампании, план проверки исполнения постановлений Правительства и открытый микрофон для членов партии. Начало в 19:00.$q$, $q$2026-11-05T12:00:00Z$q$),
  ($q$Партия выступила в защиту мирных протестов$q$, $q$statement$q$, $q$Партия Равных Прав осудила попытки ограничить право граждан на мирные собрания. «Право на протест — не привилегия, а конституционная гарантия, — заявил заместитель Председателя Мануэль Кастельяно. — Мы будем защищать каждого, кто выходит на улицу с мирными требованиями».$q$, $q$2026-10-29T17:45:00Z$q$),
  ($q$Отчёт: правовая помощь жителям района Flint$q$, $q$report$q$, $q$Юридический комитет партии провёл очередную приёмную субботу: 34 жителя района Flint получили бесплатные консультации по вопросам защиты прав при задержании, трудовых споров и дискриминации. Приёмная работает каждую субботу с 12:00 до 16:00 по адресу штаб-квартиры.$q$, $q$2026-10-24T14:10:00Z$q$),
  ($q$Анонс: школа гражданских прав$q$, $q$announcement$q$, $q$Приглашаем на цикл занятий «Школа гражданских прав»: четыре встречи о Конституции штата, процедурах обжалования незаконных действий власти и безопасном участии в мирных акциях. Ведут юристы партии, вход свободный, регистрация через форму вступления с пометкой «Школа».$q$, $q$2026-10-18T10:00:00Z$q$)
) as v(title, category, body, at)
where not exists (select 1 from public.news_posts);

-- ── 6. Назначить администратора ─────────────────────────────────────
-- Укажите тот же email, что вы создали в Authentication → Users.
-- Если пользователя ещё нет — создайте его и запустите только этот блок ещё раз.
insert into public.admins (user_id)
select id from auth.users where email = 'admin@erp-party.com'
on conflict (user_id) do nothing;

-- Проверка: должна вернуться 1 строка с вашим email
select u.email, a.user_id
from public.admins a
join auth.users u on u.id = a.user_id;
