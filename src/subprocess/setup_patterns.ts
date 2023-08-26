// import * as log from "@/src/log.ts";
import initMc from "@/src/subprocess/mc.ts";
import {
  setPlayerCommandListener,
  setServerMessageListener,
  removePlayerCommandListener as _removePlayerCommandListener,
  removeServerMessageListener,
} from "@/src/subprocess/mc_events.ts";
import { mc, rnr } from "@/src/queue.ts";
import * as ws from "@/src/websocket-server/ws.ts";
import * as players from "@/src/subprocess/players.ts";
import { getCurrentInstance } from "@/main.ts";
import * as world_manager from "@/src/subprocess/world_manager.ts";
import * as saves_manifest from "@/src/subprocess/saves_manifest.ts";

export default function setupPatterns(p: ReturnType<typeof initMc>) {
  setServerMessageListener("Done (", () => {
    console.log("World ready");
    p.worldReady = true;

    mc.sendCMD("say Hello World!");
    ws.emit.instanceStatus({ running: true, worldReady: true });
  });

  setServerMessageListener("logged in with entity", (data) => {
    const [name] = data.message.split("[");

    mc.sendCMD(`say Hello ${name}!`);

    players.add(name);

    ws.emit.instancePlayers(players.getAll());
  });

  setServerMessageListener("lost connection:", (data) => {
    const [name] = data.message.split(" ");

    players.remove(name);

    ws.emit.instancePlayers(players.getAll());
  });

  setServerMessageListener("Stopping server", () => {
    players.clear();

    ws.emit.instancePlayers(players.getAll());
  });

  setPlayerCommandListener("echo", (data) => {
    const playerName = data.playername;
    const message = data.command!.args.join(" ");

    mc.sendCMD(`w ${playerName} ${message}`);
  });

  setPlayerCommandListener(["skipworld", "sw"], async () => {
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

  setPlayerCommandListener(["save", "backup", "sc"], (data) => {
    const [savename] = data.command!.args;
    mc.sendCMD(
      `say ${savename ? `Saving world as '${savename}'` : "Saving world"}...`
    );

    mc.sendCMD("save-all");
    setServerMessageListener("Saved the game", async () => {
      removeServerMessageListener("Saved the game");
      const saveResult = await world_manager.saveCurrent(savename);

      if (saveResult.success) {
        mc.sendCMD(`say Saved world as ${saveResult.savename}`);
        saves_manifest.reindex();
      } else {
        mc.sendCMD(`say Failed to save world. Reason: ${saveResult.reason}`);
      }
    });
  });

  setPlayerCommandListener("reindex", async () => {
    const _ = await saves_manifest.reindex();

    mc.sendCMD("say Reindexed saves.");
  });

  setPlayerCommandListener("listsaves", async (data) => {
    await saves_manifest.reindex();
    const saves = await saves_manifest.getAll();

    const verbose = ["all", "verbose"].includes(
      data.command!.args[0]?.toLowerCase() ?? ""
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

  setPlayerCommandListener(["loadsave", "load"], async (data) => {
    await saves_manifest.reindex();
    const [saveNameRaw, replaceCurrentRaw] = data.command!.args;

    if (!saveNameRaw) {
      mc.sendCMD(`say Please specify a save name.`);
      return;
    }

    const saveName = !saveNameRaw.endsWith(".zip")
      ? saveNameRaw + ".zip"
      : saveNameRaw;
    const replaceCurrent = [
      "true",
      "yes",
      "y",
      "overwrite",
      "replace",
      "-f",
    ].includes(replaceCurrentRaw?.toLowerCase() ?? "");

    if (!(await saves_manifest.has(saveName))) {
      mc.sendCMD(`say Save '${saveName}' not found.`);
      return;
    }

    // perhaps instead of prompting the user, we save the world temporarily and store it for x-amount-of-time
    if (!replaceCurrent) {
      mc.sendCMD(`say There is already a world loaded.`);
      mc.sendCMD(
        `say If you wish to keep it, save it first and then rerun the command with "replace" as an argument.`
      );
      return;
    }

    mc.sendCMD(`say Loading save '${saveName}'...`);
    mc.sendCMD("stop");

    const instance = getCurrentInstance();
    const _stopped = await instance!.childProcess.status;

    const loadStatus = await world_manager.loadWorld(saveName, replaceCurrent);
    if (!loadStatus.success) return;

    rnr.push("start");
  });
}
