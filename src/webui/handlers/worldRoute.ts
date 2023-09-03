import { Hono } from "hono/mod.ts";

import * as world_helper from "@/src/webui/helpers/world_helper.ts";

const app = new Hono();

app.get("/world", async (c) => {
  return c.json(await world_helper.getSavesOverview());
});

export default app;
