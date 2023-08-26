import { WS } from "@/src/websocket-server/ws.ts";
import { Message } from "@/src/websocket/message.ts";
// import log from "./utils/log.ts";

import handlePing from "@/src/websocket-server/ws_routes/ping_route.ts";
import handleRunner from "@/src/websocket-server/ws_routes/runner_route.ts";
import handleMcCmd from "@/src/websocket-server/ws_routes/mc_cmd_route.ts";

export default function route(message: Message, ws: WS) {
  if (message.type != "ping") {
    console.log(`Incoming message of type: ${message.type}`);
  }

  switch (message.type) {
    default:
      console.log(`Unknown message type: ${message.type}`);
      return ws.json({ type: "error", data: "Unknown message type" });
    case "ping":
      return handlePing(ws);
    case "runner":
      return handleRunner(ws, message);
    case "mc_cmd":
      return handleMcCmd(message);
  }
}
