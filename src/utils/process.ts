import { TextLineStream } from "std_streams/text_line_stream.ts";

/**
 * Note: Requires `stdout` and `stderr` to be piped in order to work.
 */
function debugCommandOutput(p: Deno.CommandOutput) {
  const stderrOutput = new TextDecoder().decode(
    new Uint8Array(p.stderr.buffer)
  );
  console.log(`\n---stderr---\n${stderrOutput}\n---\n`);
  const stdoutOutput = new TextDecoder().decode(
    new Uint8Array(p.stdout.buffer)
  );
  console.log(`\n---stdout---\n${stdoutOutput}\n---\n`);
}

function streamLogger(logger?: (str: string) => void) {
  logger ??= (str: string) => {
    console.log(`%c  >> ${str}`, "color:#999");
  };

  return new WritableStream<string>({
    start: (_) => {
      logger!(" --- STREAMLOGGER START --- ");
    },
    write: (chunk) => {
      logger!(chunk);
    },
    close: () => {
      logger!(" --- STREAMLOGGER END   --- ");
    },
  });
}

function logStdoutStderrPair(pair: {
  stdout: ReadableStream<Uint8Array>;
  stderr: ReadableStream<Uint8Array>;
}) {
  const { stdout, stderr } = pair;

  {
    stdout
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream())
      .pipeTo(streamLogger());

    const errLogger = (str: string) => {
      console.log(`%c  >> ${str}`, "color:#900");
    };
    stderr
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream())
      .pipeTo(streamLogger(errLogger));
  }
}

export { debugCommandOutput, streamLogger, logStdoutStderrPair };
