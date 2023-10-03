import * as msg from "@/src/websocket/message.ts";
import * as clients from "@/src/websocket-server/clients.ts";
import route from "@/src/websocket-server/message_router.ts";
// import { logToDisk } from "./utils/log.ts";
import * as players from "@/src/subprocess/players.ts";

import { getCurrentInstance } from "@/main.ts";
import { emitInstanceStatus } from "@/src/websocket-server/trigger/instance_status.ts";
import { emitInstanceStdout } from "@/src/websocket-server/trigger/instance_stdout.ts";
import { emitInstancePlayers } from "@/src/websocket-server/trigger/instance_players.ts";
import { emitJarsChange } from "@/src/websocket-server/trigger/jars_trigger.ts";

export interface WS extends WebSocket {
  id: string;
  json: (data: msg.Message) => void;
}

function setupWS(socket: WebSocket) {
  const ws = socket as WS;
  ws.id = crypto.randomUUID();
  ws.json = (data: unknown) => ws.send(JSON.stringify(data));

  ws.onopen = (e) => handleOpen(e, ws);
  ws.onmessage = (e) => handleMessage(e, ws);
  ws.onerror = (e) => handleError(e, ws);
  ws.onclose = (e) => handleClose(e, ws);
}

function handleOpen(_e: WebSocketEventMap["open"], ws: WS) {
  clients.add(ws);

  const connectMessage: msg.Message = {
    type: "connected",
    data: { id: ws.id, timestamp: new Date().toJSON() },
  };

  ws.json(connectMessage);

  const { running, worldReady } = getCurrentInstance() ?? {};
  emitInstanceStatus({ running, worldReady }, ws);

  ws.json({ type: "instance_players", data: players.getAll() });
}

function handleMessage(e: WebSocketEventMap["message"], ws: WS) {
  const message = msg.parse(e.data as string);
  if (!message) {
    // logToDisk(`${e.data}`, "logs/invalid_messages.log");
    return ws.json({ type: "error", data: "Invalid message" });
  }

  return route(message, ws);
}

function handleError(e: WebSocketEventMap["error"], ws: WS) {
  console.log("socket error:", e);
  clients.remove(ws);
}

function handleClose(e: WebSocketEventMap["close"], ws: WS) {
  const { code, reason } = e;

  console.log("socket closed", { code, reason, id: ws.id });
  clients.remove(ws);
}

export { setupWS };

export const emit = {
  instanceStatus: emitInstanceStatus,
  instanceStdout: emitInstanceStdout,
  instancePlayers: emitInstancePlayers,
  instanceJars: emitJarsChange,
};
