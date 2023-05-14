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

export default MinecraftInstance;
