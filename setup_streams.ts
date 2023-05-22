import initMc from "./mc.ts";
import { handleMcOutput } from "./mc_events.ts";
import { mc } from "./queue.ts";

export default function setupStreams(p: ReturnType<typeof initMc>) {
  //allow attached shell, webui and patternHandlers to read from mc stdout
  async function readSubprocessStdout() {
    const loop = () => setTimeout(() => readSubprocessStdout(), 10);

    if (p.childProcess.stdout.locked || p.stopped) {
      loop();
      return;
    }

    const reader = p.childProcess.stdout!.getReader();
    const output = (await reader.read()).value;
    if (output !== undefined) {
      const str = new TextDecoder().decode(output).trim();
      pipeToPatternHandlers(str);
      str.split("\n").forEach((line) => {
        console.log(`%c>%c ${line}`, "color: #f00", "color: initial");
      });
      //   stdout_queue.push(str);
      //   log.saveRaw(str);
    }

    reader.releaseLock();
    loop();
  }

  async function writeSubprocessStdin() {
    const loop = () => setTimeout(() => writeSubprocessStdin(), 200);

    if (p.stopped || p.childProcess.stdin.locked) {
      loop();
      return;
    }

    const msg = mc.pop();
    if (!msg) {
      loop();
      return;
    }

    const input = new TextEncoder().encode(msg + "\n");

    const w = p.childProcess.stdin.getWriter();
    await w.write(input);
    w.releaseLock();

    loop();
  }

  function pipeToPatternHandlers(data: string) {
    handleMcOutput(data);
  }

  readSubprocessStdout();
  writeSubprocessStdin();
}
