import { McSubProcess } from "../../subprocess/mc.ts";
import { clients } from "../clients.ts";
import { WS } from "../ws.ts";

type InstanceStatus = Partial<Pick<McSubProcess, "running" | "worldReady">>;

function getStatusMessage(o: InstanceStatus) {
  if (o.running === false) return "stopped";
  if (o.running === true && o.worldReady === true) return "running";
  if (o.running === true) return "starting";
  return "pending";
}

export function emitInstanceStatus(o: InstanceStatus, ws?: WS) {
  const msg = getStatusMessage(o);

  if (ws) return ws.json({ type: "instance_status", data: msg });
  clients.forEach((ws) => {
    ws.json({ type: "instance_status", data: msg });
  });

  return { clientsUpdated: clients.size };
}
