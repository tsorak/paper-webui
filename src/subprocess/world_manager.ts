import * as zip from "@/src/utils/zip.ts";
import * as mc_version from "@/src/subprocess/mc_version.ts";
import * as saves_manifest from "@/src/subprocess/saves_manifest.ts";
import { resolve } from "path/resolve.ts";
import { exists } from "fs/exists.ts";
import { debugCommandOutput } from "@/src/utils/process.ts";

async function getSaves(): Promise<{ name: string; version: string }[]> {
  const saves: { name: string; jar?: string }[] = [];
  //   for await (const save of Deno.readDir("./saves")) {
  //     save.name;
  //   }
  //TODO: read saves manifest
}

async function saveCurrent(
  savename?: string
): Promise<
  { success: true; savename: string } | { success: false; reason: string }
> {
  savename ||= new Date()
    .toJSON()
    .split(".")[0]
    .replaceAll(":", "-")
    .replace("T", "_");
  savename = savename.replaceAll(" ", "_");
  if (!savename.endsWith(".zip")) savename += ".zip";

  const manifest_entry = await saves_manifest.get(savename);
  if (manifest_entry && manifest_entry.deleted !== true)
    return { success: false, reason: "Savename already exists." };

  const savePath = resolve(Deno.cwd(), `./saves/${savename}`);
  const compressResult = await zip.compress(".", savePath, {
    workdir: resolve(Deno.cwd(), "./mc"),
    flags: ["-i", "world**"],
  });
  //   const possibleDimensions = ["world", "world_nether", "world_the_end"];
  //   const dimensions: string[] = [];
  //   for await (const entry of Deno.readDir(resolve(Deno.cwd(), "./mc"))) {
  //     if (possibleDimensions.includes(entry.name) && entry.isDirectory) {
  //       dimensions.push(entry.name);
  //     }
  //   }
  //   const savePath = resolve(Deno.cwd(), `./saves/${savename}`);
  //   const zipResult = await zip.compress(dimensions, savePath, {
  //     workdir: resolve(Deno.cwd(), "./mc"),
  //   });

  if (!compressResult.success) {
    debugCommandOutput(compressResult);
    return { success: false, reason: "Compress process failed." };
  }

  const currentJar = await mc_version.getActiveVersion();
  await saves_manifest.add({ name: savename, jar: currentJar });

  return { success: true, savename };
}

async function deleteCurrent() {
  const dimensions: string[] = [];
  for await (const entry of Deno.readDir(resolve(Deno.cwd(), "./mc"))) {
    if (entry.name.startsWith("world") && entry.isDirectory) {
      dimensions.push(entry.name);
    }
  }

  const deletions: Promise<void>[] = [];
  dimensions.forEach((dimension) => {
    const deletion = Deno.remove(resolve(Deno.cwd(), `./mc/${dimension}`), {
      recursive: true,
    });
    deletions.push(deletion);
  });

  return await Promise.all(deletions);
}

// async function hasCurrentBeenSaved(): Promise<boolean> {}

async function hasActiveWorld(): Promise<boolean> {
  return await exists(resolve(Deno.cwd(), "./mc/world"));
}

async function loadWorld(
  saveName: string,
  replaceCurrent = false
): Promise<{ success: true } | { success: false; reason: string }> {
  if (replaceCurrent) await deleteCurrent();

  if ((await hasActiveWorld()) && !replaceCurrent) {
    return { success: false, reason: "A world is already loaded." };
  }

  const decompressResult = await zip.decompress(
    resolve(Deno.cwd(), `./saves/${saveName}`),
    resolve(Deno.cwd(), "./mc")
  );

  if (!decompressResult.success) {
    debugCommandOutput(decompressResult);
    return { success: false, reason: "Decompress process failed." };
  }

  return { success: true };
}

async function cloneWorld(
  saveName: string,
  to: string
): Promise<{ success: true } | { success: false; reason: string }> {
  if (saveName === "world") return { success: false, reason: "Invalid name." };

  const saveExists = await saves_manifest.get(saveName);
  if (!saveExists) return { success: false, reason: "Save does not exist." };

  const toExists = await saves_manifest.get(to);
  if (toExists) return { success: false, reason: "Save already exists." };

  try {
    await Deno.copyFile(
      resolve(Deno.cwd(), `./saves/${saveName}`),
      resolve(Deno.cwd(), `./saves/${to}`)
    );
  } catch (err) {
    console.error(err);
    return { success: false, reason: "Clone process failed." };
  }

  await saves_manifest.add({ name: to, jar: saveExists.jar });

  return { success: true };
}

export {
  getSaves,
  saveCurrent,
  deleteCurrent,
  hasActiveWorld,
  loadWorld,
  cloneWorld,
};
