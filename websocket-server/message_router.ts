import { WS } from "./ws.ts";
import { Message } from "../websocket/message.ts";
import log from "./utils/log.ts";

import handlePing from "./ws_routes/ping_route.ts";
import handleRunner from "./ws_routes/runner_route.ts";
import handleMcCmd from "./ws_routes/mc_cmd_route.ts";

export default function route(message: Message, ws: WS) {
  if (message.type != "ping") log(`Incoming message of type: ${message.type}`);

  switch (message.type) {
    default:
      log(`Unknown message type: ${message.type}`);
      return ws.json({ type: "error", data: "Unknown message type" });
    case "ping":
      return handlePing(ws);
    case "runner":
      return handleRunner(ws, message);
    case "mc_cmd":
      return handleMcCmd(message);
  }
}
