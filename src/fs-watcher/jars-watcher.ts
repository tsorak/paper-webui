import { startWatching } from "@/src/fs-watcher.ts";
import { exists } from "fs/mod.ts";
import { resolve } from "path/resolve.ts";
import { default as SubscriptionSet } from "@/src/utils/SubscriptionSet.ts";

const jarDirState: SubscriptionSet<string> = new SubscriptionSet();

function init() {
  const jarsWatcher = Deno.watchFs(resolve(Deno.cwd(), "jars"));

  startWatching(jarsWatcher, handleJarDirEvent);
}

async function handleJarDirEvent(event: Deno.FsEvent) {
  if (["create", "remove", "modify"].includes(event.kind) === false) return;

  const [jarName, renamedTo] = toJarName(event.paths) ?? [];

  if (event.kind === "create") {
    if (!jarName) return;
    handleJarCreation(jarName);
  } else if (event.kind === "remove") {
    if (!jarName) return;
    handleJarDeletion(jarName);
  } else if (event.kind === "modify") {
    if (jarName && renamedTo) {
      handleJarDeletion(jarName);
      handleJarCreation(renamedTo);
    }

    // when a file is moved from a directory to another, it emits a modify event. Not a remove->create event.
    // if only jarname is present, it is possible that it moved away.
    // we assert whether it did or not by checking if it exists.
    if (jarName && !(await exists(event.paths[0]))) {
      handleJarDeletion(jarName);
    }
  }
}

function toJarName(paths: string[]): string[] | undefined {
  const filename = paths[0].split("/").pop();
  const renamedTo = paths[1]?.split("/").pop();

  if (!renamedTo) {
    return filename?.endsWith(".jar") ? [filename] : undefined;
  }

  if (!renamedTo.endsWith(".jar")) return undefined;

  return [filename!, renamedTo];
}

function handleJarCreation(jarName: string) {
  jarDirState.add(jarName);
}

function handleJarDeletion(jarName: string) {
  jarDirState.delete(jarName);
}

// jarDirState.subscribe("add", (jarName) => {
//   console.log(`Jar '${jarName}' added`);
// });

// jarDirState.subscribe("delete", (jarName) => {
//   console.log(`Jar '${jarName}' deleted`);
// });

// jarDirState.subscribe(["add", "delete"], () => {
//   const currentDirState = Array.from(jarDirState.values());
//   console.log(currentDirState);
// });

// const firstTimeAdd = (jarName: string) => {
//   console.log(`Congratulations! You added '${jarName}'!`);
//   jarDirState.unsubscribe("add", firstTimeAdd);
// };
// jarDirState.subscribe("add", firstTimeAdd);

export { init, jarDirState };
