import { WS } from "@/src/websocket-server/ws.ts";

export default function handlePing(ws: WS) {
  return ws.json({ type: "pong", data: { timestamp: new Date().toJSON() } });
}
