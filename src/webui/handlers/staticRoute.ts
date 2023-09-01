import { Hono } from "hono/mod.ts";

import { mc } from "@/src/queue.ts";
import * as static_helper from "@/src/webui/helpers/static_helper.ts";

const app = new Hono();

app.get("/assets/:filename", async (c) => {
  const file = c.req.param("filename");
  if (!file) return c.notFound();

  const assetExists = await static_helper.assetExists(file);
  if (!assetExists) return c.notFound();

  c.res.headers.set("Content-Type", static_helper.getContentType(file));

  const fileData = await static_helper.getAssetData(file);
  return c.newResponse(fileData);
});

app
  .get("/", async (c) => {
    if (!Deno.env.has("DEV")) return c.html(await static_helper.getIndex());

    const build = await static_helper.buildApp();
    if (!build.success) {
      return c.json({ message: "Failed to build app" }, 500);
    }

    return c.html(await static_helper.getIndex());
  })
  .post("/", async (c) => {
    if (static_helper.isJsonContentType(c.req.headers) === false) {
      return c.json({ message: "Bad Request" }, 400);
    }

    const command = await static_helper.getCommandFromBody(c.req);
    if (command === undefined) {
      return c.json({ message: "Bad Request" }, 400);
    }

    mc.sendCMD(command);

    return c.json({ message: "OK" }, 200);
  });

export default app;
