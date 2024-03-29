import initMc from "@/src/subprocess/mc.ts";
import { mc, rnr } from "@/src/queue.ts";
import * as ws from "@/src/websocket-server/ws.ts";

function runner() {
  let instance: ReturnType<typeof initMc> | undefined;
  function start() {
    console.log(
      "[%crunner%c] Starting Minecraft server...",
      "color: #f00",
      "color: initial"
    );
    instance = initMc();
    handleExit();
    ws.emit.instanceStatus({ running: true, worldReady: false });
  }
  async function stop() {
    console.log(
      "[%crunner%c] Stopping Minecraft server...",
      "color: #f00",
      "color: initial"
    );
    mc.push("stop");
    await instance!.childProcess.status;
  }
  async function handleExit() {
    const { code } = await instance!.childProcess.status;
    console.log(
      `[%crunner%c] Minecraft server stopped. (%c${code}%c)`,
      "color: #f00",
      "color: initial",
      `color: ${code === 0 ? "#0f0" : "#f00"}`,
      "color: initial"
    );
    instance!.running = false;
    instance!.worldReady = false;
    ws.emit.instanceStatus({ running: false, worldReady: false });
  }

  async function runCommands() {
    const loop = () => setTimeout(() => runCommands(), 200);

    const cmd = rnr.pop()?.replace("!", "");
    if (!cmd) {
      loop();
      return;
    }
    switch (cmd) {
      case "start":
        if (instance?.running === true) break;
        start();
        break;
      case "restart":
        if (instance?.running === true) await stop();
        start();
        break;
      case "stop":
        if (instance?.running === true) stop();
        break;
      case "status":
        console.log(
          `[%crunner%c] Minecraft server is %c${
            instance?.running ? "running" : "stopped"
          }%c.`,
          "color: #f00",
          "color: initial",
          `color: ${instance?.running ? "#0f0" : "#f00"}`,
          "color: initial"
        );
        break;
      default:
        console.log(
          `[%crunner%c] Unknown command: %c${cmd}`,
          "color: #f00",
          "color: initial",
          "color: #f00"
        );
        break;
    }

    loop();
  }

  //   start();
  runCommands();

  const getInstance = () => instance;
  return getInstance;
}

export default runner;
