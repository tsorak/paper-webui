import { exists } from "fs/mod.ts";
import { resolve } from "path/mod.ts";

import * as saves_manifest from "@/src/subprocess/saves_manifest.ts";
import * as mc_version from "@/src/subprocess/mc_version.ts";

interface SavesOverview {
  currentVersion?: string;
  saves: {
    name: string;
    version?: string;
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
  { name: "world"; version?: string } | undefined
> {
  const path = resolve(Deno.cwd(), "mc/world");
  if (!(await exists(path))) return undefined;

  // The world version can not always be determined from looking at the active server version.
  // The user may have moved a world from another server version manually.

  const version = await mc_version.getActiveVersion();
  return { name: "world", version };
}

export { getSavesOverview };
