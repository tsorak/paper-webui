import { rnr } from "../../queue.ts";
import { Message } from "../../websocket/message.ts";
import { WS } from "../ws.ts";

export default function handleRunner(
  ws: WS,
  message: Message & { type: "runner" }
) {
  const { data } = message;
  if (typeof data !== "string")
    return ws.json({ type: "error", data: "Runner data must be a string" });

  switch (data) {
    default:
      return ws.json({ type: "error", data: "Unknown runner data" });
    case "start":
      return rnr.push("start");
    case "restart":
      return rnr.push("restart");
    case "stop":
      return rnr.push("stop");
  }
}
