import { Message } from "../../websocket/message";
import { CS } from "../socket";
import logWS from "../utils/socket_logger";

export default function handleConnected(
  message: Message & { type: "connected" },
  ws: CS
) {
  const { data } = message;
  ws.id = data.id;

  logWS(`Recieved and set socket id: ${ws.id}`);

  logWS(`Starting pinger...`);
  ws.pinger?.start();
}
