import { serve } from "https://deno.land/std@0.159.0/http/server.ts";

import mc, { setWorldReady } from "./mc.ts";
import * as log from "./log.ts";
import setupStreams from "./setup_streams.ts";
import setupPatterns from "./setup_patterns.ts";

import webui from "./webui.ts";

async function init_mc() {
  const childProcess = mc.spawn();

  log.both(`Paper spawned with PID:`, childProcess.pid);

  const mcProcess = setupStreams(childProcess);
  setupPatterns(mcProcess);

  //wait for mc to exit
  const processExit = await childProcess.status;
  log.out("Server stopped");
  setWorldReady(false);
  Deno.exit(processExit.code);
}

function init_http() {
  const listener = serve(webui, { port: 8080 });
  return listener;
}

function main() {
  init_mc();
  init_http();
}

main();
