import { startWatching } from "@/src/fs-watcher.ts";
import { exists } from "fs/mod.ts";
import { resolve } from "path/resolve.ts";
import { default as SubscriptionSet } from "@/src/utils/SubscriptionSet.ts";

const dirState: SubscriptionSet<string> = new SubscriptionSet();

function init() {
  const savesWatcher = Deno.watchFs(resolve(Deno.cwd(), "saves"));

  startWatching(savesWatcher, handleDirEvent);
}

async function handleDirEvent(event: Deno.FsEvent) {
  if (["create", "remove", "modify"].includes(event.kind) === false) return;

  const [name, renamedTo] = toName(event.paths) ?? [];

  if (event.kind === "create") {
    if (!name) return;
    handleCreation(name);
  } else if (event.kind === "remove") {
    if (!name) return;
    handleDeletion(name);
  } else if (event.kind === "modify") {
    if (name && renamedTo) {
      handleDeletion(name);
      handleCreation(renamedTo);
    }

    // when a file is moved from a directory to another, it emits a modify event. Not a remove->create event.
    // if only name is present, it is possible that it moved away.
    // we assert whether it did or not by checking if it exists.
    if (name && !(await exists(event.paths[0]))) {
      handleDeletion(name);
    }
  }
}

function toName(paths: string[]): string[] | undefined {
  const filename = paths[0].split("/").pop();
  const renamedTo = paths[1]?.split("/").pop();

  if (!renamedTo) {
    return filename?.endsWith(".zip") ? [filename] : undefined;
  }

  if (!renamedTo.endsWith(".zip")) return undefined;

  return [filename!, renamedTo];
}

function handleCreation(name: string) {
  dirState.add(name);
}

function handleDeletion(name: string) {
  dirState.delete(name);
}

export { init, dirState as saveDirState };
