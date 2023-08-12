import { Hono } from "@/deps.ts";
import { getActiveVersion } from "@/subprocess/mc_version.ts";

const app = new Hono();

app.get("/world", async (c) => {
  return c.json({
    currentVersion: await getActiveVersion(),
    saves: [],
  });
});

export default app;
