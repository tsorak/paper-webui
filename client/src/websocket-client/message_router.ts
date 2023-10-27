import { Message } from "../websocket/message";
import { CS } from "./socket";
import logWS from "./utils/socket_logger";

import handleConnected from "./handlers/handleConnected";
import handlePong from "./handlers/handlePong";
import handleInstanceStatus from "./handlers/handleInstanceStatus";
import handleInstanceStdout from "./handlers/handleInstanceStdout";
import handleInstancePlayers from "./handlers/handleInstancePlayers";
import handleJarsChange from "./handlers/handleJarsChange";
import handleSavesChange from "./handlers/handleSavesChange";

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
    case "instance_status":
      return handleInstanceStatus(message, ws);
    case "instance_stdout":
      return handleInstanceStdout(message, ws);
    case "instance_players":
      return handleInstancePlayers(message, ws);
    case "jars_change":
      return handleJarsChange(message, ws);
    case "saves_change":
      return handleSavesChange(message, ws);
  }
}
