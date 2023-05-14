import setupStreams from "./setup_streams.ts";
import * as log from "./log.ts";

import { setWorldReady } from "./mc.ts";

export default function setupPatterns(
  mcProcess: ReturnType<typeof setupStreams>
) {
  mcProcess.setPatternListener("]: Done (", () => {
    log.both("World Ready.");
    setWorldReady(true);

    //
    mcProcess.sendMcCommand("say Hello World!");
  });

  mcProcess.setPatternListener("joined the game", (data) => {
    const [name] = data.split("]: ")[1].split(" ");

    mcProcess.sendMcCommand(`say Hello ${name}!`);
  });
}
