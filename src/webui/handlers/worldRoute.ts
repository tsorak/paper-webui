import { Hono } from "hono/mod.ts";

import * as world_helper from "@/src/webui/helpers/world_helper.ts";
import * as world_validator from "@/src/webui/validators/world_validator.ts";
import badRequest from "@/src/webui/honoutils/badRequest.ts";

const app = new Hono();

app.get("/world", async (c) => {
  return c.json(await world_helper.getSavesOverview());
});

app.post("/world", world_validator.validate.POST, (c) => {
  const { kind, props } = c.req.valid("json");

  switch (kind) {
    default:
      return badRequest(c);
  }
});
export default app;
