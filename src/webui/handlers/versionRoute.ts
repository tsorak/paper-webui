import { Hono } from "hono/mod.ts";

import * as serverVersions from "@/src/subprocess/mc_version.ts";
import * as jar_manager from "@/src/subprocess/jar_manager.ts";

const app = new Hono();

app
  .get("/installed_versions", async (c) => {
    const versions = await jar_manager.getInstalledJars();
    const activeJar = await jar_manager.getActiveJarName();
    return c.json({ versions, activeJar });
  })
  .put("/installed_versions", async (c) => {
    const { jarName } = (await c.req.json()) as { jarName: string };

    if (!jarName || !jarName.endsWith(".jar")) {
      return c.json({ error: "Invalid request" }, 400);
    }

    const success = await jar_manager.setActiveJar(`./jars/${jarName}`);

    return c.json({ success }, success ? 200 : 400);
  });

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

      const jarStatus = await jar_manager.handleJarDownload(
        jar.url,
        jar.name,
        submitType
      );

      return c.json({ message: jarStatus.message, ...jar }, jarStatus.status);
    }

    if (serverType && !submitType) {
      return c.json(await serverVersions.getVersions(serverType));
    }

    return c.json({ error: "Invalid request" }, 400);
  });

export default app;
