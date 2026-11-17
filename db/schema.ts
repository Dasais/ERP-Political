import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  int,
  timestamp,
  // bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Заявки на вступление в партию */
export const joinApplications = mysqlTable("join_applications", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  age: int("age").notNull(),
  contact: varchar("contact", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["new", "reviewed"]).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type JoinApplication = typeof joinApplications.$inferSelect;

/** Новости и акции партии */
export const newsPosts = mysqlTable("news_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["report", "statement", "announcement"])
    .notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type NewsPost = typeof newsPosts.$inferSelect;

/** Члены партии и их должности (управляются из панели /admin) */
export const members = mysqlTable("members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).default("Член партии").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Member = typeof members.$inferSelect;

/** Главы Устава партии (управляются из панели /admin) */
export const statuteChapters = mysqlTable("statute_chapters", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  /** Абзацы разделяются пустой строкой */
  body: text("body").notNull(),
  sortOrder: int("sort_order").default(0).notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type StatuteChapter = typeof statuteChapters.$inferSelect;
