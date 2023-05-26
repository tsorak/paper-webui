import { McSubProcess } from "../../subprocess/mc.ts";
import { InstanceStatusData, Message } from "../../websocket/message.ts";
import { clients } from "../clients.ts";
import { WS } from "../ws.ts";

type InstanceStatus = Partial<Pick<McSubProcess, "running" | "worldReady">>;

function getStatusMessage(o: InstanceStatus): InstanceStatusData {
  if (o.running === false) return "stopped";
  if (o.running === true && o.worldReady === true) return "running";
  if (o.running === true) return "starting";
  return "pending";
}

export function emitInstanceStatus(o: InstanceStatus, ws?: WS) {
  const status = getStatusMessage(o);
  const msg = { type: "instance_status", data: status } as Message;

  if (ws) return ws.json(msg);
  clients.forEach((ws) => {
    ws.json(msg);
  });

  return { clientsUpdated: clients.size };
}
