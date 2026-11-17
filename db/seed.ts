import { getDb } from "../api/queries/connection";
import { newsPosts, members, statuteChapters } from "./schema";
import { DEFAULT_MEMBERS, DEFAULT_STATUTE } from "./defaults";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  const existingNews = await db.select({ id: newsPosts.id }).from(newsPosts).limit(1);
  if (existingNews.length > 0) {
    console.log("News already seeded, skipping.");
  } else {
    await db.insert(newsPosts).values([
      {
        title: "Митинг у здания Правительства: требуем отчёта по бюджету",
        category: "report",
        body: "Состоялся мирный митинг Партии Равных Прав у здания Правительства штата. Председатель Хойт Хантсингер потребовал публичного отчёта о расходовании бюджета и напомнил, что власть обязана отчитываться перед народом ежеквартально. К мероприятию присоединились жители района Flint и активисты партийных ячеек.",
        createdAt: new Date("2026-11-12T19:30:00Z"),
      },
      {
        title: "Официальная претензия Правительству штата",
        category: "statement",
        body: "Высший Совет партии направил Правительству официальную претензию в связи с отказом публиковать протоколы закрытых заседаний. Мы требуем немедленного раскрытия документов в соответствии с принципом подотчётности власти народу. Ответ ожидается в течение 14 дней.",
        createdAt: new Date("2026-11-08T15:00:00Z"),
      },
      {
        title: "Анонс: отчётное собрание Высшего Совета",
        category: "announcement",
        body: "15 ноября в штаб-квартире партии (район Flint, ул. Angel Crest Way, д. 3019) состоится отчётное собрание Высшего Совета. На повестке: итоги митинговой кампании, план проверки исполнения постановлений Правительства и открытый микрофон для членов партии. Начало в 19:00.",
        createdAt: new Date("2026-11-05T12:00:00Z"),
      },
      {
        title: "Партия выступила в защиту мирных протестов",
        category: "statement",
        body: "Партия Равных Прав осудила попытки ограничить право граждан на мирные собрания. «Право на протест — не привилегия, а конституционная гарантия, — заявил заместитель Председателя Мануэль Кастельяно. — Мы будем защищать каждого, кто выходит на улицу с мирными требованиями».",
        createdAt: new Date("2026-10-29T17:45:00Z"),
      },
      {
        title: "Отчёт: правовая помощь жителям района Flint",
        category: "report",
        body: "Юридический комитет партии провёл очередную приёмную субботу: 34 жителя района Flint получили бесплатные консультации по вопросам защиты прав при задержании, трудовых споров и дискриминации. Приёмная работает каждую субботу с 12:00 до 16:00 по адресу штаб-квартиры.",
        createdAt: new Date("2026-10-24T14:10:00Z"),
      },
      {
        title: "Анонс: школа гражданских прав",
        category: "announcement",
        body: "Приглашаем на цикл занятий «Школа гражданских прав»: четыре встречи о Конституции штата, процедурах обжалования незаконных действий власти и безопасном участии в мирных акциях. Ведут юристы партии, вход свободный, регистрация через форму вступления с пометкой «Школа».",
        createdAt: new Date("2026-10-18T10:00:00Z"),
      },
    ]);
    console.log("News seeded.");
  }

  const existingMembers = await db.select({ id: members.id }).from(members).limit(1);
  if (existingMembers.length === 0) {
    await db
      .insert(members)
      .values(DEFAULT_MEMBERS.map((m, i) => ({ name: m.name, role: m.role, sortOrder: i })));
    console.log("Members seeded.");
  }

  const existingStatute = await db.select({ id: statuteChapters.id }).from(statuteChapters).limit(1);
  if (existingStatute.length === 0) {
    await db.insert(statuteChapters).values(
      DEFAULT_STATUTE.map((c, i) => ({ title: c.title, body: c.paragraphs.join("\n\n"), sortOrder: i })),
    );
    console.log("Statute seeded.");
  }

  console.log("Done.");
  process.exit(0); // close MySQL connection pool
}

seed();
