import { getCurrentInstance } from "@/main.ts";

import { rnr, mc } from "@/src/queue.ts";

/**
 * Runs the provided function, executing it only when the server is stopped, and starts the server if it resolves.
 */
async function performWithRestart<T>(fn: () => T): Promise<T> {
  if (!getCurrentInstance()?.running) {
    const fnResult = await fn();
    rnr.push("start");

    return fnResult;
  }

  await ensureInstanceStopped();
  const fnResult = await fn();
  rnr.push("start");

  return fnResult;
}

async function ensureInstanceStopped() {
  mc.sendCMD("stop");

  const _stopped = await getCurrentInstance()?.childProcess.status;
}

export { performWithRestart };
