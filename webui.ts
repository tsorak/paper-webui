import { Hono } from "./deps.ts";

import { getCurrentInstance } from "./main.ts";
import { mc } from "./queue.ts";
import { handleJarDownload } from "./subprocess/jar_manager.ts";

import * as serverVersions from "./subprocess/mc_version.ts";

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
      cwd: "./client"
    }).outputSync();

    const html = Deno.readTextFileSync("./client/dist/index.html");
    return c.html(html);
  })
  .post("/", async (c) => {
    const body = (await c.req.json()) as { command: string };

    mc.sendCMD(body.command);

    return c.json({ message: "OK" }, 200);
  });

// TODO: add patch endpoint for switching between installed jars
app
  .get("/version", (c) => {
    return c.json(["vanilla", "papermc"]);
  })
  .post("/version", async (c) => {
    // Usually two requests fire at this endpoint in quick succession.
    // Both requests fetch the respective serverType version.
    // Optimise by caching the version list for x amount of time.

    const { serverType, serverVersion, submitType } = (await c.req.json()) as {
      serverType?: "" | "vanilla" | "papermc";
      serverVersion?: string;
      submitType?: "use" | "download";
    };

    if (serverType && serverVersion) {
      console.log(serverType, serverVersion);

      const versions = await serverVersions.getVersions(serverType);
      const foundVersion = versions.find((v) => v.id === serverVersion);

      if (!foundVersion) return c.json({ error: "Invalid version" }, 400);
      // console.log(foundVersion?.id, foundVersion?.url);

      let jar: { url: string; name: string };
      switch (serverType) {
        case "vanilla":
          jar = await serverVersions.getVanillaJar(foundVersion.url);
          break;

        case "papermc":
          jar = await serverVersions.getPaperJar(foundVersion.url);
          break;
      }

      // TODO:
      // add restart confirmation to UI
      // ask weather to create a new world or use existing one?

      console.log(jar);

      const jarStatus = await handleJarDownload(jar.url, jar.name, submitType);

      return c.json({ message: jarStatus.message, ...jar }, jarStatus.status);
    }

    if (serverType && !submitType) {
      return c.json(await serverVersions.getVersions(serverType));
    }

    return c.json({ error: "Invalid request" }, 400);
  });

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
        args: ["-cd", `./mc/logs/${log}`]
      }).output()
    ).stdout;

    const text = new TextDecoder().decode(buf);
    return c.text(text);
  }

  const text = Deno.readTextFileSync(`./mc/logs/${log}`);
  return c.text(text);
});

export default app.fetch;
