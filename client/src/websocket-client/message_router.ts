import { Message } from "../../../websocket/message";
import { CS } from "./socket";
import logWS from "./utils/socket_logger";

import handleConnected from "./handlers/handleConnected";
import handlePong from "./handlers/handlePong";

export default function route(message: Message, ws: CS) {
  if (message.type !== "pong") {
    logWS(`Received message:`);
    console.log(message);
  }

  switch (message.type) {
    default:
      return console.log(`Unknown message type: ${message.type}`);
    case "pong":
      return handlePong(message, ws);
    case "connected":
      return handleConnected(message, ws);
  }
}
