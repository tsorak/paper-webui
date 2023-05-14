import mc from "./mc.ts";
import * as log from "./log.ts";
import setupStreams from "./setup_streams.ts";
import setupPatterns from "./setup_patterns.ts";

async function main() {
  const childProcess = mc.spawn();

  log.both(`Paper spawned with PID:`, childProcess.pid);

  const mcProcess = setupStreams(childProcess);
  setupPatterns(mcProcess);

  //wait for mc to exit
  const processExit = await childProcess.status;
  log.out("Server stopped");
  Deno.exit(processExit.code);
}

main();
