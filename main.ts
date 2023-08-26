import build from "@/build.ts";

import { mc, rnr } from "./queue.ts";
import runner from "./runner.ts";
import httpHandler from "./webserver.ts";
import * as jar_manager from "./subprocess/jar_manager.ts";
import * as saves_manifest from "./subprocess/saves_manifest.ts";

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
}

main();

export { getCurrentInstance };
