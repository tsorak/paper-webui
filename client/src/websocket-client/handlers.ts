import route from "./message_router";
import * as msg from "../websocket/message";
import { CS } from "./socket";
import logWS from "./utils/socket_logger";
import setupPinger from "./utils/pinger";
import { useMcContext } from "../context/mcContext";

export default function setupHandlers(
  websocket: WebSocket,
  reconnectFn: () => void
): CS {
  const socket = websocket as CS;
  socket.json = (data: unknown) => socket.send(JSON.stringify(data));
  socket.id = "";
  socket.pinger = setupPinger(socket);

  socket.onopen = (e) => handleOpen(e, socket);
  socket.onmessage = (e) => handleMessage(e, socket);
  socket.onclose = (e) => handleClose(e, socket, reconnectFn);
  socket.onerror = (e) => handleError(e, socket);

  return socket;
}

function handleOpen(e: WebSocketEventMap["open"], socket: CS) {
  logWS(`Connected to ${socket.url}`);
}

function handleMessage(e: WebSocketEventMap["message"], socket: CS) {
  const message = msg.parse(e.data as string);
  if (!message) return logWS(`Invalid message: ${e.data}`);

  return route(message, socket);
}

function handleClose(
  e: WebSocketEventMap["close"],
  socket: CS,
  reconnectFn: () => void
) {
  socket.pinger?.stop();

  logWS(`Disconnected from ${socket.url}`);
  console.log(e);

  if (e.code === 1006) {
    logWS(`Attempting to reconnect...`);
    reconnectFn();
  }

  useMcContext()[1]("mcInstance", "status", "pending");
}

function handleError(e: WebSocketEventMap["error"], socket: CS) {
  socket.pinger?.stop();

  logWS(`Socket errored`);
  console.log(e);
}
