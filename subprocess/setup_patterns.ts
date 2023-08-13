import * as log from "../log.ts";
import initMc from "./mc.ts";
import { setPatternListener } from "./mc_events.ts";
import { mc, rnr } from "../queue.ts";
import * as ws from "../websocket-server/ws.ts";
import * as players from "./players.ts";
import { getCurrentInstance } from "../main.ts";
import * as world_manager from "./world_manager.ts";

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

    players.add(name);

    ws.emit.instancePlayers(players.getAll());
  });

  setPatternListener("left the game", (data) => {
    const [name] = data.split("]: ")[1].split(" ");

    players.remove(name);

    ws.emit.instancePlayers(players.getAll());
  });

  setPatternListener("]: Stopping server", () => {
    players.clear();

    ws.emit.instancePlayers(players.getAll());
  });

  setPatternListener("> !echo", (data) => {
    const [playerName] = data.split("<")[1].split(">");
    const message = data.split("> !echo ")[1];

    mc.sendCMD(`w ${playerName} ${message}`);
  });

  setPatternListener(["> !skipworld", "> !sw"], async () => {
    mc.sendCMD("say Skipping world...");
    mc.sendCMD("stop");
    const instance = getCurrentInstance();
    console.log("Waiting for server to stop...");
    const _stopped = await instance!.childProcess.status;
    console.log("Server stopped.");

    console.log("Deleting world...");
    const deleted = await world_manager.deleteCurrent();
    console.log("World deleted.");
    console.log(`Removed ${deleted.length} dimension(s).`);

    rnr.push("start");
  });
}
