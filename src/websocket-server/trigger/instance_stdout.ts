import { clients } from "@/src/websocket-server/clients.ts";

export function emitInstanceStdout(msg: string) {
  clients.forEach((client) => {
    client.ws.json({
      type: "instance_stdout",
      data: msg,
    });
  });
}
