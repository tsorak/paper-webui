import { rnr } from "@/src/queue.ts";
import { Message } from "@/src/websocket/message.ts";
import { WS } from "@/src/websocket-server/ws.ts";

export default function handleRunner(
  ws: WS,
  message: Message & { type: "runner" }
) {
  const { data } = message;
  if (typeof data !== "string")
    return ws.json({ type: "error", data: "Runner data must be a string" });

  switch (data) {
    case "start":
      return rnr.push("start");
    case "restart":
      return rnr.push("restart");
    case "stop":
      return rnr.push("stop");
    default:
      return ws.json({ type: "error", data: "Unknown runner data" });
  }
}
