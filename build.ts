import { resolve, toFileUrl } from "path/mod.ts";
import { exists } from "fs/mod.ts";

import { logStdoutStderrPair } from "@/src/utils/process.ts";

async function build() {
  //   const cleanedLatestLog = cleanLatestLog();
  const clientPrepareState = prepareClient();

  const faultyDirs = await getFaultyDirs();

  const hasConflictingFiles = faultyDirs.conflictingFiles.length > 0;
  if (hasConflictingFiles) {
    panicOnConflictingFiles(faultyDirs.conflictingFiles);
  }

  await createMissingDirs(faultyDirs.missingDirs);

  await eula();

  return { clientPrepareState };
}

async function prepareClient() {
  console.log("Preparing client...");

  const install = await installClientDependencies();
  if (!install.success) {
    console.log("Failed to install client dependencies.");
    return install;
  }
  console.log("Installed client dependencies.");

  const build = await buildClient();
  if (!build.success) {
    console.log("Failed to build client.");
    return build;
  }
  console.log("Client built successfully.");

  return build;
}

async function installClientDependencies() {
  const spawned = new Deno.Command("npm", {
    args: ["install"],
    cwd: resolve(Deno.cwd(), "client"),
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  const { stdout, stderr } = spawned;
  logStdoutStderrPair({ stdout, stderr });

  return await spawned.status;
}

async function buildClient() {
  const spawned = new Deno.Command("npm", {
    args: ["run", "build"],
    cwd: resolve(Deno.cwd(), "client"),
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  const { stdout, stderr } = spawned;
  logStdoutStderrPair({ stdout, stderr });

  return await spawned.status;
}

async function getFaultyDirs() {
  const requiredDirs = ["saves", "jars", "mc"];

  const cwdEntries: { name: string; isDirectory: boolean }[] = [];

  const cwdUrl = toFileUrl(resolve(Deno.cwd()));
  for await (const entry of Deno.readDir(cwdUrl)) {
    if (requiredDirs.includes(entry.name)) {
      cwdEntries.push({ name: entry.name, isDirectory: entry.isDirectory });
    }
  }

  const missingDirs = requiredDirs.filter(
    (name) => !cwdEntries.find((cwdEntry) => cwdEntry.name === name)
  );

  const conflictingFiles = cwdEntries
    .filter((entry) => {
      return !entry.isDirectory;
    })
    .map((entry) => entry.name);

  const faultyEntries = { missingDirs, conflictingFiles };
  return faultyEntries;
}

function panicOnConflictingFiles(conflictingFiles: string[]) {
  console.error(
    `Conflicting files found in the working directory:\n${conflictingFiles.join(
      "\n"
    )}\n\nPlease move/rename them and restart the program.`
  );
  Deno.exit(1);
}

async function createMissingDirs(missingDirs: string[]) {
  if (!missingDirs.length) {
    return;
  }

  console.log(
    `The following directories are missing:\n${missingDirs.join("\n")}`
  );
  console.log("Creating them now...");

  const dirCreation: Promise<void>[] = [];
  missingDirs.forEach((dir) => {
    console.log(`Creating ${Deno.cwd()}/${dir}`);

    const creationPromise = Deno.mkdir(toFileUrl(resolve(Deno.cwd(), dir)));
    dirCreation.push(creationPromise);
  });

  await Promise.all(dirCreation);
}

async function eula() {
  const eulaPath = toFileUrl(resolve(Deno.cwd(), "mc/eula.txt"));

  const eulaExists = await exists(eulaPath, { isFile: true });
  if (eulaExists) {
    return;
  }

  console.log("Press ENTER to accept EULA");
  Deno.stdin.readSync(new Uint8Array(1));

  await Deno.writeTextFile(eulaPath, "eula=true\n", { create: true });
}

export { build as default, buildClient };
