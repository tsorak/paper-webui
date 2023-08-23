import { resolve } from "path/mod.ts";
import * as jsonfile from "jsonfile/mod.ts";

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

interface SaveEntry {
  name: string;
  jar?: string;
  deleted?: boolean;
}

const init = async () => {
  try {
    const _ = await Deno.stat(resolve(Deno.cwd(), "./.saves_manifest.json"));
    reindex();
    return;
  } catch (_) {
    //
  }
  await writeManifest([]);

  reindex();
};

// const init_watcher = async () => {
//   const watcher = Deno.watchFs("./saves", { recursive: false });
//   for await (const event of watcher) {

//   }
// };

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

  manifest.push(entry);

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

export { get, has, add, getAll, reindex, init };

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
