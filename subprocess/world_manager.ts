import * as zip from "@/utils/zip.ts";
import * as mc_version from "./mc_version.ts";
import * as saves_manifest from "./saves_manifest.ts";
import { resolve } from "path/resolve.ts";

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
  const zipResult = await zip.compress(".", savePath, {
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

  if (!zipResult.success) {
    const stderrOutput = new TextDecoder().decode(
      new Uint8Array(zipResult.stderr.buffer)
    );
    console.log(stderrOutput);

    const stdoutOutput = new TextDecoder().decode(
      new Uint8Array(zipResult.stdout.buffer)
    );
    console.log(stdoutOutput);

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

export { getSaves, saveCurrent, deleteCurrent };
