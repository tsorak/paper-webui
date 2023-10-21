import { exists } from "fs/mod.ts";
import { resolve } from "path/mod.ts";

import * as saves_manifest from "@/src/subprocess/saves_manifest.ts";
import * as mc_version from "@/src/subprocess/mc_version.ts";
import * as world_manager from "@/src/subprocess/world_manager.ts";
import { ensureZipExtension } from "@/src/utils/savename.ts";

interface SavesOverview {
  currentVersion?: string;
  saves: {
    name: string;
    jar?: string;
    deleted?: boolean;
  }[];
}

async function getSavesOverview(): Promise<SavesOverview> {
  const [currentVersion, saves] = await Promise.all([
    mc_version.getActiveVersion(),
    getSaves(),
  ]);

  return { currentVersion, saves };
}

async function getSaves() {
  const _ensureUpToDate = saves_manifest.reindex();

  const gatherSaves = Promise.all([saves_manifest.getAll(), getCurrentWorld()]);
  const [saves, currentWorld] = await gatherSaves;

  if (currentWorld) {
    return [...saves, currentWorld];
  } else {
    return saves;
  }
}

async function getCurrentWorld(): Promise<
  { name: "world"; jar?: string } | undefined
> {
  const path = resolve(Deno.cwd(), "mc/world");
  if (!(await exists(path))) return undefined;

  // The world version can not always be determined from looking at the active server version.
  // The user may have moved a world from another server version manually.

  const jar = await mc_version.getActiveVersion();
  return { name: "world", jar };
}

async function saveExists(name: string): Promise<boolean> {
  await saves_manifest.reindex();

  name = ensureZipExtension(name);

  const save = await saves_manifest.get(name);
  if (!save || save.deleted) return false;

  return true;
}

async function loadSave(name: string, options?: { replaceCurrent?: boolean }) {
  const { replaceCurrent } = options ?? {};

  return await world_manager.loadWorld(name, { replaceCurrent });
}

async function cloneSave(name: string, to: string) {
  to = ensureZipExtension(to);

  if (await saveExists(to)) {
    return { success: false, reason: "Save already exists." };
  }

  if (name === "world") {
    return await world_manager.saveCurrent(to);
  }

  return await world_manager.cloneWorld(name, to);
}

export { getSavesOverview, saveExists, loadSave, cloneSave };
