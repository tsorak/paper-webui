import { Hono } from "https://deno.land/x/hono@v3.1.8/mod.ts";

import { getCurrentInstance } from "./main.ts";
import { mc } from "./queue.ts";

const app = new Hono();

app.get("/", (c) => {
  const worldReady = getCurrentInstance()?.worldReady ?? false;

  if (c.req.headers.get("accept") === "application/json") {
    return c.json({ worldReady });
  }
  const html = Deno.readTextFileSync("./index.html").replace(
    "WORLDREADY",
    worldReady ? "true" : "false"
  );

  return c.html(html);
});

app.post("/", async (c) => {
  const body = (await c.req.json()) as { command: string };

  mc.sendCMD(body.command);

  return c.json({ message: "OK" }, 200);
});

export default app.fetch;
