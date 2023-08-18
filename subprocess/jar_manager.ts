import { fileExists } from "../utils/fs.ts";
// import { rnr } from "../queue.ts";

async function init() {
  try {
    await Deno.mkdir("./jars");
  } catch (_e) {
    // Dir exists
  }
}

async function handleJarDownload(
  url: string,
  saveName: string,
  doneAction: "use" | "download" = "download"
): Promise<{ message: string; status: 409 | 202 }> {
  //
  const jarExists = await fileExists(`./jars/${saveName}`);
  if (jarExists) return { message: "Jar already exists", status: 409 };

  downloadJar(url, saveName, doneAction);

  return { message: "Downloading jar", status: 202 };
}

async function downloadJar(
  url: string,
  saveName: string,
  doneAction: "use" | "download" = "download"
) {
  const jar = await fetch(url);
  const jarBuffer = await jar.arrayBuffer();
  await Deno.writeFile(`./jars/${saveName}`, new Uint8Array(jarBuffer));

  if (doneAction === "use") {
    setActiveJar(`./jars/${saveName}`);
    // rnr.push("restart");
  }
}

async function setActiveJar(path: string) {
  try {
    await Deno.remove("./server.jar");
  } catch (_) {
    //
  }
  try {
    await Deno.symlink(path, "./server.jar");
    return true;
  } catch (_) {
    //
  }
  return false;
}

async function getInstalledJars() {
  const jars = [];
  for await (const dirEntry of Deno.readDir("./jars")) {
    if (dirEntry.isFile) {
      jars.push(dirEntry);
    }
  }
  return jars.map((jar) => jar.name);
}

async function getActiveJarName() {
  try {
    const jar = await Deno.realPath("./server.jar");
    return jar.split("/").pop();
  } catch (_e) {
    //
  }

  return "";
}

export {
  init,
  handleJarDownload,
  setActiveJar,
  getInstalledJars,
  getActiveJarName,
};
