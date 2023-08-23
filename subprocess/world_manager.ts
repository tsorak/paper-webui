import * as zip from "@/utils/zip.ts";
import * as mc_version from "./mc_version.ts";
import * as saves_manifest from "./saves_manifest.ts";
import { resolve } from "path/resolve.ts";
import { exists } from "fs/exists.ts";
import { debugCommandOutput } from "@/utils/process.ts";

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

export { getSaves, saveCurrent, deleteCurrent, hasActiveWorld, loadWorld };
