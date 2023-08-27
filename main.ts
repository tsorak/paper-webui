import build from "@/build.ts";

import { mc, rnr } from "@/src/queue.ts";
import runner from "@/src/runner.ts";
import httpHandler from "@/src/webserver.ts";
import * as jar_manager from "@/src/subprocess/jar_manager.ts";
import * as saves_manifest from "@/src/subprocess/saves_manifest.ts";
import * as fs_watcher from "@/src/fs-watcher.ts";

function initHttp() {
  return Deno.serve({ port: 8080 }, httpHandler);
}

async function readStdin(stream = Deno.stdin.readable) {
  const reader = stream.getReader();
  const buf = (await reader.read()).value;
  reader.releaseLock();
  if (!buf) {
    readStdin();
    return;
  }

  const str = new TextDecoder().decode(buf);
  const formatted = str.trim();
  if (!formatted) {
    readStdin();
    return;
  }
  if (formatted.startsWith("!")) {
    rnr.push(formatted);
  } else {
    mc.push(formatted);
  }

  readStdin();
}

let getCurrentInstance: () =>
  | ReturnType<ReturnType<typeof runner>>
  | undefined = () => undefined;

async function main() {
  await build();

  readStdin();
  getCurrentInstance = runner();
  initHttp();
  jar_manager.init();
  saves_manifest.init();

  fs_watcher.initJarsWatcher();
}

main();

export { getCurrentInstance };
