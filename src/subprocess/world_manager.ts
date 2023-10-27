import * as zip from "@/src/utils/zip.ts";
import * as mc_version from "@/src/subprocess/mc_version.ts";
import { savesState } from "@/src/globalState.ts";
import { resolve } from "path/resolve.ts";
import { exists } from "fs/exists.ts";
import { debugCommandOutput } from "@/src/utils/process.ts";
import { ensureZipExtension } from "@/src/utils/savename.ts";

// This module should not do any validation
// Use world_helper instead as it does validation

async function saveCurrent(
  savename: string
): Promise<
  { success: true; savedAs: string } | { success: false; reason: string }
> {
  savename = savename.replaceAll(" ", "_");
  savename = ensureZipExtension(savename);

  const savePath = resolve(Deno.cwd(), `./saves/${savename}`);
  const compressResult = await zip.compress(".", savePath, {
    workdir: resolve(Deno.cwd(), "./mc"),
    flags: ["-i", "world**"],
  });

  if (!compressResult.success) {
    debugCommandOutput(compressResult);
    return { success: false, reason: "Compress process failed." };
  }

  const jar = await mc_version.getActiveVersion();
  savesState.set(savename, { name: savename, jar });

  return { success: true, savedAs: savename };
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

async function deleteWorld(
  savename: string
): Promise<{ success: true } | { success: false; reason?: string }> {
  try {
    await Deno.remove(resolve(Deno.cwd(), `./saves/${savename}`));
  } catch (err) {
    console.error(err);
    return {
      success: false,
      reason: `Failed to remove ${savename} from disk.`,
    };
  }

  savesState.update(savename, { deleted: true });

  return { success: true };
}

// async function hasCurrentBeenSaved(): Promise<boolean> {}

async function hasActiveWorld(): Promise<boolean> {
  return await exists(resolve(Deno.cwd(), "./mc/world"));
}

async function loadWorld(
  saveName: string,
  options?: { replaceCurrent?: boolean }
): Promise<{ success: true } | { success: false; reason: string }> {
  const replaceCurrent = options?.replaceCurrent ?? false;
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

  const saveExists = savesState.get(saveName);
  if (!saveExists) return { success: false, reason: "Save does not exist." };

  try {
    await Deno.copyFile(
      resolve(Deno.cwd(), `./saves/${saveName}`),
      resolve(Deno.cwd(), `./saves/${to}`)
    );
  } catch (err) {
    console.error(err);
    return { success: false, reason: "Clone process failed." };
  }

  const { jar } = saveExists;
  savesState.set(to, { name: to, jar });

  return { success: true };
}

export {
  saveCurrent,
  deleteCurrent,
  hasActiveWorld,
  loadWorld,
  cloneWorld,
  deleteWorld,
};
