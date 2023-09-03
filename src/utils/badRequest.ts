import { Context } from "hono/mod.ts";

/**
 * Takes a Hono Context and returns a 400 Bad Request `text` response.
 */
export default function (c: Context) {
  return c.text("Bad Request", 400);
}
