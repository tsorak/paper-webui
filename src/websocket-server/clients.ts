import { WS } from "@/src/websocket-server/ws.ts";
// import log from "@/src/websocket-server/utils/log.ts";

type Client = {
  ws: WS;
};

const clients = new Map<string, Client>();

function add(ws: WS) {
  clients.set(ws.id, { ws });
  console.log(`Add client ${ws.id}`);
}

function remove(ws: WS) {
  clients.delete(ws.id);
  console.log(`Remove client ${ws.id}`);
}

export { clients, add, remove };
