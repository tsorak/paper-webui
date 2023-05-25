import { WS } from "./ws.ts";
import { Message } from "../websocket/message.ts";
import log, { logToDisk } from "./utils/log.ts";

import handlePing from "./ws_routes/ping_route.ts";

export default function route(message: Message, ws: WS) {
  if (message.type != "ping") log(`Incoming message of type: ${message.type}`);

  switch (message.type) {
    default:
      logToDisk(
        `{${message.type}} ${JSON.stringify(message)}`,
        "./logs/unknown_message_types.log"
      );
      return ws.json({ error: "Unknown message type" });
    case "ping":
      return handlePing(ws);
  }
}
