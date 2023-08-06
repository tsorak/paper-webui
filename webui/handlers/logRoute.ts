import { Hono } from "@/deps.ts";

const app = new Hono();

app.get("/logs", async (c) => {
  const dir: string[] = [];
  for await (const dirEntry of Deno.readDir("./mc/logs")) {
    dir.push(dirEntry.name);
  }

  return c.text(dir.sort().join("\n"));
});

app.get("/logs/:log", async (c) => {
  const log = c.req.param("log");
  if (!log) return c.text("No log file specified.", 400);

  try {
    const fileExists = (await Deno.stat(`./mc/logs/${log}`)).isFile;
    if (!fileExists) return c.text("No log file found.", 404);
  } catch (_) {
    return c.text("No log file found.", 404);
  }

  if (log.endsWith(".gz")) {
    const buf = (
      await new Deno.Command("gzip", {
        args: ["-cd", `./mc/logs/${log}`],
      }).output()
    ).stdout;

    const text = new TextDecoder().decode(buf);
    return c.text(text);
  }

  const text = Deno.readTextFileSync(`./mc/logs/${log}`);
  return c.text(text);
});

export default app;
