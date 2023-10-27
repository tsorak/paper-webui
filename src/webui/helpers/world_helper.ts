import { exists } from "fs/mod.ts";
import { resolve } from "path/mod.ts";

import { savesState } from "@/src/globalState.ts";
import * as mc_version from "@/src/subprocess/mc_version.ts";
import * as world_manager from "@/src/subprocess/world_manager.ts";
import { ensureZipExtension } from "@/src/utils/savename.ts";
import { getCurrentInstance } from "@/main.ts";

import type { SaveEntry } from "../../types.ts";

interface SavesOverview {
  currentVersion?: string;
  saves: SaveEntry[];
}

async function getSavesOverview(): Promise<SavesOverview> {
  const [currentVersion, saves] = await Promise.all([
    mc_version.getActiveVersion(),
    getSaves(),
  ]);

  return { currentVersion, saves };
}

async function getSaves() {
  const saves = savesState.getAll();
  const currentWorld = await getCurrentWorld();

  if (currentWorld) {
    return [...saves, currentWorld];
  } else {
    return saves;
  }
}

async function getCurrentWorld(): Promise<
  | {
      name: "world";
      jar: string;
    }
  | {
      name: "world";
      jar?: undefined;
    }
  | undefined
> {
  const path = resolve(Deno.cwd(), "mc/world");
  if (!(await exists(path))) return undefined;

  // The world version can not always be determined from looking at the active server version.
  // The user may have moved a world from another server version manually.

  const jar = await mc_version.getActiveVersion();
  return jar ? { name: "world", jar } : { name: "world" };
}

function saveExists(name: string): boolean {
  name = ensureZipExtension(name);

  const save = savesState.get(name);
  if (!save || save.deleted) return false;

  return true;
}

async function loadSave(name: string, options?: { replaceCurrent?: boolean }) {
  const { replaceCurrent } = options ?? {};

  return await world_manager.loadWorld(name, { replaceCurrent });
}

async function cloneSave(name: string, to: string) {
  to = ensureZipExtension(to);

  if (saveExists(to)) {
    return { success: false, reason: "Save already exists." };
  }

  if (name === "world") {
    return await world_manager.saveCurrent(to);
  }

  return await world_manager.cloneWorld(name, to);
}

async function deleteSave(
  name: string
): Promise<{ success: true } | { success: false; reason?: string }> {
  if (name === "world") {
    if (getCurrentInstance()?.running) {
      return {
        success: false,
        reason: "Can not delete the active world while the server is running.",
      };
    }

    await world_manager.deleteCurrent();
    return { success: true };
  }

  name = ensureZipExtension(name);
  return await world_manager.deleteWorld(name);
}

export { getSavesOverview, saveExists, loadSave, cloneSave, deleteSave };
