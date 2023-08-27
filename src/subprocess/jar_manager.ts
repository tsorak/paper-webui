import { exists, ensureDir } from "fs/mod.ts";
import { resolve } from "path/mod.ts";
// import { rnr } from "../queue.ts";

async function ensureJarDir() {
  const jarDirPath = resolve(Deno.cwd(), "./jars");
  await ensureDir(jarDirPath);
}

async function init() {
  await ensureJarDir();
}

async function handleJarDownload(
  url: string,
  saveName: string,
  doneAction: "use" | "download" = "download"
): Promise<{ message: string; status: 409 | 202 }> {
  //
  const jarExists = await exists(resolve(Deno.cwd(), `./jars/${saveName}`));
  if (jarExists) return { message: "Jar already exists", status: 409 };

  downloadJar(url, saveName, doneAction);

  return { message: "Downloading jar", status: 202 };
}

async function downloadJar(
  url: string,
  saveName: string,
  doneAction: "use" | "download" = "download"
) {
  const jarResult = await fetch(url);
  const jarData = new Uint8Array(await jarResult.arrayBuffer());
  await Deno.writeFile(resolve(Deno.cwd(), `./jars/${saveName}`), jarData);

  if (doneAction === "use") {
    setActiveJar(`./jars/${saveName}`);
    // rnr.push("restart");
  }
}

async function setActiveJar(path: string) {
  if (!path) return false;
  try {
    await Deno.remove(resolve(Deno.cwd(), "./server.jar"));
  } catch (_) {
    //
  }
  try {
    await Deno.symlink(
      resolve(Deno.cwd(), path),
      resolve(Deno.cwd(), "./server.jar")
    );
    return true;
  } catch (_) {
    //
  }
  return false;
}

async function getInstalledJars() {
  const jars = [];
  for await (const dirEntry of Deno.readDir(resolve(Deno.cwd(), "./jars"))) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".jar")) {
      jars.push(dirEntry.name);
    }
  }
  return jars;
}

async function getActiveJarName() {
  try {
    const jar = await Deno.realPath(resolve(Deno.cwd(), "./server.jar"));
    return jar.split("/").pop();
  } catch (_e) {
    //
  }

  return undefined;
}

export {
  init,
  handleJarDownload,
  setActiveJar,
  getInstalledJars,
  getActiveJarName,
};
