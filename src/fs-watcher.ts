export { init as initJarsWatcher } from "@/src/fs-watcher/jars-watcher.ts";
export { init as initSavesWatcher } from "@/src/fs-watcher/saves-watcher.ts";

async function startWatching(
  watcher: Deno.FsWatcher,
  callback: (fsEvent: Deno.FsEvent) => void
) {
  for await (const event of watcher) {
    callback(event);
  }
}

export { startWatching };
