import { resolve } from "path/mod.ts";
import * as jsonfile from "jsonfile/mod.ts";
import { exists } from "fs/exists.ts";
import { savesStateRaw } from "@/src/globalState.ts";

async function loadManifest() {
  return (await jsonfile.readJson(
    resolve(Deno.cwd(), "./.saves_manifest.json")
  )) as SaveEntry[];
}

async function writeManifest(data: SaveEntry[]) {
  return await jsonfile.writeJson(
    resolve(Deno.cwd(), "./.saves_manifest.json"),
    data,
    { spaces: 2 }
  );
}

export interface SaveEntry {
  name: string;
  jar?: string;
  deleted?: boolean;
}

const setInitialState = async () => {
  const initialState = await read();
  savesStateRaw._reset(initialState);
};

const init = async () => {
  if (await exists(resolve(Deno.cwd(), "./.saves_manifest.json"))) {
    await reindex();
    await setInitialState();
    return;
  }

  await writeManifest([]);
  await reindex();
  await setInitialState();
  return;
};

const reindex = async () => {
  const manifest = await loadManifest();

  const currentSaves: string[] = [];
  for await (const save of Deno.readDir(resolve(Deno.cwd(), "./saves"))) {
    currentSaves.push(save.name);
  }

  currentSaves.forEach((save) => {
    const entry = manifest.find((entry) => entry.name === save);
    if (!entry) {
      manifest.push({ name: save });
    }
  });

  manifest.forEach((entry) => {
    if (!currentSaves.includes(entry.name)) {
      entry.deleted = true;
    }
  });

  return await writeManifest(manifest);
};

async function read() {
  const manifest = await loadManifest();
  return manifest.map((entry) => [entry.name, entry]) as [string, SaveEntry][];
}

async function write(map: Map<string, SaveEntry>) {
  const saveEntries = Array.from(map.values());
  return await writeManifest(saveEntries);
}

export { init, read, write };
