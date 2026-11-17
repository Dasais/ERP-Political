import { authRouter } from "./auth-router";
import { newsRouter } from "./news-router";
import { applicationsRouter } from "./applications-router";
import { membersRouter } from "./members-router";
import { statuteRouter } from "./statute-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  news: newsRouter,
  applications: applicationsRouter,
  members: membersRouter,
  statute: statuteRouter,

  // TODO: add feature routers here, e.g.
  // todo: createRouter({
  //   list: publicQuery.query(() => findTodos()),
  // }),
});

export type AppRouter = typeof appRouter;
