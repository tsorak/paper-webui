import * as zip from "@/utils/zip.ts";
import * as mc_version from "./mc_version.ts";
import * as saves_manifest from "./saves_manifest.ts";

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

  const savePath = `../saves/${savename}`;
  await zip.compress(["./", "-i", "world**"], savePath, { workdir: "./mc" });

  const currentJar = await mc_version.getActiveVersion();
  await saves_manifest.add({ name: savename, jar: currentJar });

  return { success: true, savename };
}

async function deleteCurrent() {
  const dimensions: string[] = [];
  for await (const entry of Deno.readDir("./mc")) {
    if (entry.name.startsWith("world") && entry.isDirectory) {
      dimensions.push(entry.name);
    }
  }

  const deletions: Promise<void>[] = [];
  dimensions.forEach((dimension) => {
    const deletion = Deno.remove(`./mc/${dimension}`, { recursive: true });
    deletions.push(deletion);
  });

  return await Promise.all(deletions);
}

export { getSaves, saveCurrent, deleteCurrent };