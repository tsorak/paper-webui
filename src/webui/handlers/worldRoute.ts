import { Context, Hono } from "hono/mod.ts";

import * as world_helper from "@/src/webui/helpers/world_helper.ts";
import * as world_validator from "@/src/webui/validators/world_validator.ts";
import type {
  Prop,
  LoadProp,
  CloneProp,
} from "@/src/webui/validators/world_validator.ts";
import badRequest from "@/src/utils/badRequest.ts";
import { getCurrentInstance } from "@/main.ts";
import { performWithRestart } from "@/src/subprocess/helpers.ts";
import { hasActiveWorld } from "@/src/subprocess/world_manager.ts";

const app = new Hono();

app.get("/world", async (c) => {
  return c.json(await world_helper.getSavesOverview());
});

app.post("/world", world_validator.validate.POST, async (c) => {
  const { kind, props } = c.req.valid("json");

  switch (kind) {
    case "rename": {
      const { name, newName } = props;
      return c.json(await world_helper.renameSave(name, newName));
    }
    case "clone": {
      return await handleClone(props, c);
    }
    case "delete": {
      return await handleDelete(props, c);
    }
    case "download": {
      const { name } = props;
      return c.newResponse(await world_helper.downloadSave(name));
    }
    case "load": {
      return await handleLoad(props, c);
    }
    default:
      return badRequest(c);
  }
});

async function handleDelete(props: Prop, c: Context) {
  const { name } = props;

  if (name === "world" && getCurrentInstance()?.running) {
    return c.json(
      {
        error: "Can not delete the active world while the server is running.",
      },
      400
    );
  }

  const deleteResult = await world_helper.deleteSave(name);

  return c.json(deleteResult);
}

async function handleClone(props: CloneProp, c: Context) {
  const { name, to } = props;

  if (name !== "world") {
    const saveExists = await world_helper.saveExists(name);
    if (!saveExists) return badRequest(c);
  } else if (!(await hasActiveWorld())) {
    return c.json(
      {
        error: "There is no active world to clone.",
      },
      400
    );
  }

  const toExists = await world_helper.saveExists(to);
  if (toExists) return badRequest(c);

  const cloneResult = await world_helper.cloneSave(name, to);

  return c.json(cloneResult);
}

async function handleLoad(props: LoadProp, c: Context) {
  const { name, autoRestart } = props;

  if (!autoRestart && getCurrentInstance()?.running) {
    return c.json(
      {
        error: "Can not load a save while the server is running.",
      },
      400
    );
  }

  const saveExists = await world_helper.saveExists(name);
  if (!saveExists) return badRequest(c);

  let loadResult: Awaited<ReturnType<typeof world_helper.loadSave>>;
  if (getCurrentInstance()?.running) {
    loadResult = await performWithRestart(
      async () => await world_helper.loadSave(name)
    );
  } else {
    loadResult = await world_helper.loadSave(name);
  }

  return c.json(loadResult);
}

export default app;
