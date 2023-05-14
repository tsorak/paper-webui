import { mergeReadableStreams } from "https://deno.land/std@0.187.0/streams/mod.ts";

import handleMcOutput, { MCLogEvent, MCLogEvents } from "./mc_events.ts";
import * as log from "./log.ts";

function setPatternListener(
  pattern: string,
  handler: MCLogEvent["handler"],
  name = ""
): void {
  MCLogEvents.set(pattern, { name, handler });
}

export default function setupStreams(process: Deno.ChildProcess): {
  sendMcCommand: typeof sendMcCommand;
  setPatternListener: typeof setPatternListener;
} {
  const mcProcess = process;

  //allow both attached shell and webui to write to mc stdin
  const webuiStream = new TransformStream();
  const inStream = mergeReadableStreams(
    Deno.stdin.readable,
    webuiStream.readable
  );
  inStream.pipeTo(mcProcess.stdin!);

  //allow both attached shell and webui to read from mc stdout
  const [stdoutStream, outStream] = mcProcess.stdout.tee();
  stdoutStream.pipeTo(Deno.stdout.writable, { preventClose: true });
  async function pipeToPatternHandlers() {
    for await (const chunk of outStream) {
      handleMcOutput(chunk);
    }
  }
  pipeToPatternHandlers();

  async function sendMcCommand(cmd: string): Promise<void> {
    log.out(`WebUI issued: ${cmd}`);
    log.save(`WebUI issued: ${cmd}`);

    //
    const parsedCmd = cmd.replaceAll("\n", " ") + "\n";

    const chunk = new TextEncoder().encode(parsedCmd);
    const writer = webuiStream.writable.getWriter();

    await writer.write(chunk);
    writer.releaseLock();
  }

  return {
    sendMcCommand,
    setPatternListener
  };
}
