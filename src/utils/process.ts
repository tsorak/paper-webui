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

export { debugCommandOutput };
