import { Message } from "../../websocket/message";
import { useMcContext } from "../../context/mcContext";
import { CS } from "../socket";
import logWS from "../utils/socket_logger";
import * as untilStopped from "../utils/ensureStopped";

export default function handleInstanceStatus(
  message: Message & { type: "instance_status" },
  _ws: CS
) {
  const status = message.data;
  const [mcContext, setMcContext] = useMcContext();

  const lastStatus = mcContext.mcInstance.status;
  if (lastStatus !== "stopped" && status === "stopped") {
    untilStopped.resolve();
  } else if (lastStatus === "stopped" && status !== "stopped") {
    untilStopped.reset();
  }

  setMcContext("mcInstance", "status", status);

  logWS(`Recieved instance status: ${status}`);
}
