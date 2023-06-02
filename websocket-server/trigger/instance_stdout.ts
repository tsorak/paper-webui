import { clients } from "../clients.ts";

export function emitInstanceStdout(msg: string) {
  clients.forEach((client) => {
    client.ws.json({
      type: "instance_stdout",
      data: msg
    });
  });
}
