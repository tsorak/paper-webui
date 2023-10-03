import { WS } from "@/src/websocket-server/ws.ts";
// import log from "@/src/websocket-server/utils/log.ts";

type Client = {
  ws: WS;
};

const clients = new Map<string, Client>();

function add(ws: WS) {
  clients.set(ws.id, { ws });
  console.log(`[WS] %c+%c ${ws.id}`, "color: #0f0", "color: initial");
}

function remove(ws: WS) {
  clients.delete(ws.id);
  console.log(`[WS] %c-%c ${ws.id}`, "color: #f00", "color: initial");
}

export { clients, add, remove };
