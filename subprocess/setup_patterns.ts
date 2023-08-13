import * as log from "../log.ts";
import initMc from "./mc.ts";
import { removePatternListener, setPatternListener } from "./mc_events.ts";
import { mc, rnr } from "../queue.ts";
import * as ws from "../websocket-server/ws.ts";
import * as players from "./players.ts";
import { getCurrentInstance } from "../main.ts";
import * as world_manager from "./world_manager.ts";
import * as saves_manifest from "./saves_manifest.ts";

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

  setPatternListener(["> !save", "> !backup", "> !sc"], (msg) => {
    const savename = msg.split("> ")[1].split(" ")[1] || undefined;
    mc.sendCMD(
      `say ${savename ? `Saving world as '${savename}'` : "Saving world"}...`
    );

    mc.sendCMD("save-all");
    setPatternListener("]: Saved the game", async () => {
      removePatternListener("]: Saved the game");
      const saveResult = await world_manager.saveCurrent(savename);

      if (saveResult.success) {
        mc.sendCMD(`say Saved world as ${saveResult.savename}`);
        saves_manifest.reindex();
      } else {
        mc.sendCMD(`say Failed to save world. Reason: ${saveResult.reason}`);
      }
    });
  });

  setPatternListener("> !reindex", async () => {
    const _ = await saves_manifest.reindex();

    mc.sendCMD("say Reindexed saves.");
  });

  setPatternListener("> !listsaves", async (msg) => {
    const saves = await saves_manifest.getAll();

    const verbose = ["all", "verbose"].includes(
      msg.split("> !listsaves ")[1]?.split(" ")[0]
    );

    saves.forEach((save) => {
      if (verbose) {
        mc.sendCMD(
          `say ${save.name} ${save.jar ?? ""} ${
            save.deleted ? "(DELETED)" : ""
          }`
        );
      } else if (!save.deleted) {
        mc.sendCMD(`say ${save.name} ${save.jar ?? ""}`);
      }
    });
  });
}
