import { clients } from "../clients.ts";

export function emitInstancePlayers(msg: string[]) {
  clients.forEach((client) => {
    client.ws.json({
      type: "instance_players",
      data: msg
    });
  });
}
