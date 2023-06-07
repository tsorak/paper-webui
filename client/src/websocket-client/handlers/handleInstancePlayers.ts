import { Message } from "../../../../websocket/message";
import { useMcContext } from "../../context/mcContext";
import { CS } from "../socket";

export default function handleInstancePlayers(
  message: Message & { type: "instance_players" },
  _ws: CS
) {
  const players = message.data;
  const [_, setMcContext] = useMcContext();

  console.log("Received players:", players);

  setMcContext("mcInstance", "players", players);
}
