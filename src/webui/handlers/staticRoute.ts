import { Hono } from "hono/mod.ts";
import { resolve } from "path/resolve.ts";

import { debugCommandOutput } from "@/src/utils/process.ts";

import { getCurrentInstance } from "@/main.ts";
import { mc } from "@/src/queue.ts";

const app = new Hono();

app.get("/assets/:filename", async (c) => {
  const file = c.req.param("filename");
  if (file.endsWith(".js")) {
    c.res.headers.set("Content-Type", "application/javascript");
  }
  const fileData = await Deno.readFile(
    resolve(Deno.cwd(), `./client/dist/assets/`, file)
  );
  return c.newResponse(fileData);
});

app
  .get("/", async (c) => {
    const worldReady = getCurrentInstance()?.worldReady ?? false;

    if (c.req.headers.get("accept") === "application/json") {
      return c.json({ worldReady });
    }

    //build SolidJS app
    const clientBuilt = await new Deno.Command("npm", {
      args: ["run", "build"],
      cwd: resolve(Deno.cwd(), "./client"),
      stdout: "piped",
      stderr: "piped",
    }).output();

    if (!clientBuilt.success) {
      debugCommandOutput(clientBuilt);
    }

    const html = await Deno.readTextFile(
      resolve(Deno.cwd(), "./client/dist/index.html")
    );
    return c.html(html);
  })
  .post("/", async (c) => {
    const body = (await c.req.json()) as { command: string };

    mc.sendCMD(body.command);

    return c.json({ message: "OK" }, 200);
  });

export default app;
