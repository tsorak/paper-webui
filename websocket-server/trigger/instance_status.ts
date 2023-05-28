import { McSubProcess } from "../../subprocess/mc.ts";
import { InstanceStatusData, Message } from "../../websocket/message.ts";
import { clients } from "../clients.ts";
import { WS } from "../ws.ts";

type InstanceStatus = Partial<Pick<McSubProcess, "running" | "worldReady">>;

function getStatusMessage(o: InstanceStatus): InstanceStatusData {
  if (o.running === false) return "stopped";
  if (o.running === true && o.worldReady === true) return "running";
  if (o.running === true) return "starting";
  return "stopped";
}

export function emitInstanceStatus(
  status: InstanceStatusData | InstanceStatus,
  ws?: WS
) {
  status = typeof status === "string" ? status : getStatusMessage(status);
  const msg: Message & { type: "instance_status" } = {
    type: "instance_status",
    data: status
  };

  if (ws) return ws.json(msg);
  clients.forEach((ws) => {
    ws.json(msg);
  });

  return { clientsUpdated: clients.size };
}
