import { resolve } from "path/mod.ts";
import * as jsonfile from "jsonfile/mod.ts";
import { exists } from "fs/exists.ts";

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

const init = async () => {
  if (await exists(resolve(Deno.cwd(), "./.saves_manifest.json"))) {
    return await reindex();
  }

  await writeManifest([]);
  return await reindex();
};

const get = async (savename: string): Promise<SaveEntry | undefined> => {
  const manifest = await loadManifest();

  const entry = manifest.find((entry) => entry.name === savename);

  return entry;
};

const has = async (savename: string): Promise<boolean> => {
  const manifest = await loadManifest();

  const entry = manifest.some((entry) => entry.name === savename);

  return entry;
};

const add = async (entry: SaveEntry) => {
  const manifest = await loadManifest();

  const i = manifest.findIndex(
    (currentEntry) => currentEntry.name === entry.name
  );
  if (i === -1) {
    manifest.push(entry);
  } else {
    manifest[i] = entry;
  }

  return await writeManifest(manifest);
};

const getAll = async (): Promise<SaveEntry[]> => {
  const manifest = await loadManifest();
  return manifest;
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

const update = async (save: string, fields: Partial<SaveEntry>) => {
  const manifest = await loadManifest();

  const i = manifest.findIndex((entry) => entry.name === save);
  if (i === -1) {
    return false;
  }

  manifest[i] = { ...manifest[i], ...fields };

  await writeManifest(manifest);
  return true;
};

export { get, has, add, getAll, reindex, init, update };

// TODO: idea with the following commented out code is to keep a stream open to the manifest file
// could prevent rewriting the whole file every time a save is added
// const manifest_file: Deno.FsFile = await Deno.open("./.saves_manifest", {
//   append: true,
//   read: true,
//   create: true,
// });

// const get = async (savename: string): Promise<SaveEntry> => {
//   return { name: savename };
// };

// const add = async (entry: SaveEntry) => {
//   const line = `${entry.name} ${entry.jar}`;
//   const buf = new TextEncoder().encode(line);

//   const w = manifest_file.writable.getWriter();
//   await w.write(buf);
//   w.releaseLock();
// };
