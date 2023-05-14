import { worldReady } from "./mc.ts";

export default function webui(_req: Request) {
  return new Response(`World is ${worldReady ? "ready!" : "not ready."}`);
}
