import * as ws from "@/src/websocket-server/ws.ts";

export default function handleUpgrade(request: Request): Response {
  const upgrade = request.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() != "websocket") {
    return new Response(JSON.stringify({ message: "WebSocket only" }), {
      status: 426,
    });
  }
  const { socket, response } = Deno.upgradeWebSocket(request);

  ws.setupWS(socket);

  return response;
}
