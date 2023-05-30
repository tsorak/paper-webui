import { WS } from "./ws.ts";
import log from "./utils/log.ts";

type Client = {
  ws: WS;
};

const clients = new Map<string, Client>();

function add(ws: WS) {
  clients.set(ws.id, { ws });
  log(`Add client ${ws.id}`);
}

function remove(ws: WS) {
  clients.delete(ws.id);
  log(`Remove client ${ws.id}`);
}

export { clients, add, remove };
