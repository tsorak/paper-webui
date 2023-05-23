import setupStreams from "./setup_streams.ts";
import setupPatterns from "./setup_patterns.ts";

const cfg = {
  INIT_MEM: Deno.env.get("INIT_MEM") || "256M",
  MAX_MEM: Deno.env.get("MAX_MEM") || "2G",
  MC_PORT: parseInt(Deno.env.get("MC_PORT") || "25565") || 25565
};

const MinecraftInstance = new Deno.Command("java", {
  args: [
    `-Xmx${cfg.MAX_MEM}`,
    `-Xms${cfg.INIT_MEM}`,
    `-jar`,
    `../paper.jar`,
    `--nogui`,
    `--port`,
    `${cfg.MC_PORT}`
  ],
  stdout: "piped",
  stdin: "piped",
  cwd: "mc"
});

// Initialiser

type McSubProcess = ReturnType<typeof initMc>;

function initMc() {
  const childProcess = MinecraftInstance.spawn();
  const subP = { childProcess, running: true, worldReady: false };

  setupStreams(subP);
  setupPatterns(subP);

  async function handleExit() {
    await subP.childProcess.status;
    subP.running = false;
  }
  handleExit();

  return subP;
}

export default initMc as () => McSubProcess;
