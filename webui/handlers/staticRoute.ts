import { Hono } from "hono/mod.ts";

import { getCurrentInstance } from "@/main.ts";
import { mc } from "@/queue.ts";

const app = new Hono();

app.get("/assets/:filename", (c) => {
  const file = c.req.param("filename");
  if (file.endsWith(".js")) {
    c.res.headers.set("Content-Type", "application/javascript");
  }
  return c.newResponse(Deno.readFileSync(`./client/dist/assets/${file}`));
});

app
  .get("/", (c) => {
    const worldReady = getCurrentInstance()?.worldReady ?? false;

    if (c.req.headers.get("accept") === "application/json") {
      return c.json({ worldReady });
    }

    //build SolidJS app
    new Deno.Command("npm", {
      args: ["run", "build"],
      cwd: "./client",
    }).outputSync();

    const html = Deno.readTextFileSync("./client/dist/index.html");
    return c.html(html);
  })
  .post("/", async (c) => {
    const body = (await c.req.json()) as { command: string };

    mc.sendCMD(body.command);

    return c.json({ message: "OK" }, 200);
  });

export default app;
