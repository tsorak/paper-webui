import { Message } from "../../../../websocket/message";
import { CS } from "../socket";
import logWS from "../utils/socket_logger";

export default function handlePong(msg: Message, ws: CS) {
  if (!ws.lastPing) return;
  ws.latency = Date.now() - ws.lastPing!;

  //   TODO: run latency through a SolidJS Setter

  //   logWS(`Latency: ${ws.latency}ms`);
}
