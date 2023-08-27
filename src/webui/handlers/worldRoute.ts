import { Hono } from "hono/mod.ts";
import { getActiveVersion } from "@/src/subprocess/mc_version.ts";

const app = new Hono();

app.get("/world", async (c) => {
  return c.json({
    currentVersion: await getActiveVersion(),
    saves: [],
  });
});

export default app;