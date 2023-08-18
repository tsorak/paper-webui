import { resolve, toFileUrl } from "path/mod.ts";
import { exists } from "fs/mod.ts";

async function build() {
  //   const cleanedLatestLog = cleanLatestLog();
  //   const clientBuilt = buildClient();

  const faultyDirs = await getFaultyDirs();

  const hasConflictingFiles = faultyDirs.conflictingFiles.length > 0;
  if (hasConflictingFiles) {
    panicOnConflictingFiles(faultyDirs.conflictingFiles);
  }

  await createMissingDirs(faultyDirs.missingDirs);

  await eula();
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
    console.log(`Creating '${dir}' directory...`);

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

export default build;
