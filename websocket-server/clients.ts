import { WS } from "./ws.ts";
import log from "./utils/log.ts";

const clients = new Map<string, WS>();

function add(ws: WS) {
  clients.set(ws.id, ws);
  log(`Add client ${ws.id}`);
}

function remove(ws: WS) {
  clients.delete(ws.id);
  log(`Remove client ${ws.id}`);
}

export { clients, add, remove };
