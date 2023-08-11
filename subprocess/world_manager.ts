import * as zip from "zip/mod.ts";
import * as mc_version from "./mc_version.ts";
import * as saves_manifest from "./saves_manifest.ts";

async function getSaves(): Promise<{ name: string; version: string }[]> {
  const saves: { name: string; jar?: string }[] = [];
  //   for await (const save of Deno.readDir("./saves")) {
  //     save.name;
  //   }
  //TODO: read saves manifest
}

async function saveCurrent(savename?: string): Promise<boolean> {
  savename ||= new Date()
    .toJSON()
    .split(".")[0]
    .replaceAll(":", "-")
    .replace("T", "_");
  savename = savename.replaceAll(" ", "_");
  if (!savename.endsWith(".zip")) savename += ".zip";

  if (await saves_manifest.get(savename)) return false;

  const savePath = `./saves/${savename}`;
  const saveDimensions: string[] = [];
  for await (const entry of Deno.readDir("./mc")) {
    if (entry.name.includes("world")) {
      saveDimensions.push(entry.name);
    }
  }
  if (!saveDimensions.length) return false;
  await zip.compress(saveDimensions, savePath, { overwrite: true, flags: [] });

  const currentJar = await mc_version.getActiveVersion();
  saves_manifest.add({ name: savename, jar: currentJar });

  return true;
}

export { getSaves, saveCurrent };
