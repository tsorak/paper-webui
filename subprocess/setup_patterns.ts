import * as log from "../log.ts";
import initMc from "./mc.ts";
import { setPatternListener } from "./mc_events.ts";
import { mc } from "../queue.ts";
import * as ws from "../websocket-server/ws.ts";

export default function setupPatterns(p: ReturnType<typeof initMc>) {
  setPatternListener("]: Done (", () => {
    log.both("World Ready.");
    p.worldReady = true;

    mc.sendCMD("say Hello World!");
    ws.emit.instanceStatus({ running: true, worldReady: true });
  });

  setPatternListener("joined the game", (data) => {
    const [name] = data.split("]: ")[1].split(" ");

    mc.sendCMD(`say Hello ${name}!`);
  });
}
