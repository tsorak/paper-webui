import mc from "./mc.ts";
import * as log from "./log.ts";
import setupStreams from "./setup_streams.ts";

async function main() {
  const childProcess = mc.spawn();

  log.both(`Paper spawned with PID:`, childProcess.pid);

  const mcProcess = setupStreams(childProcess);

  mcProcess.setPatternListener("]: Done (", () => {
    log.both("SERVER STARTED LUL!");

    //
    mcProcess.sendMcCommand("say Hello World!");
  });

  mcProcess.setPatternListener("joined the game", (data) => {
    const [name] = data.split("]: ")[1].split(" ");

    mcProcess.sendMcCommand(`say Hello ${name}!`);
  });

  //wait for mc to exit
  const processExit = await childProcess.status;
  log.out("Server stopped");
  Deno.exit(processExit.code);
}

main();
