import { Message } from "../../websocket/message";
import { useMcContext } from "../../context/mcContext";
import { CS } from "../socket";
import logWS from "../utils/socket_logger";

export default function handleInstanceStatus(
  message: Message & { type: "instance_status" },
  _ws: CS
) {
  const status = message.data;
  const [_, setMcContext] = useMcContext();

  setMcContext("mcInstance", "status", status);

  logWS(`Recieved instance status: ${status}`);
}
