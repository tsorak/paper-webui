export interface Message {
  type: "ping" | "pong" | "connected" | "instance_status" | "runner";
  data: MessageData;
}

type MessageData =
  | PingData
  | PongData
  | ConnectedData
  | InstanceStatusData
  | RunnerData;

export type PingData = { timestamp: string };
export type PongData = never;
export type ConnectedData = { id: string; timestamp: string };
export type InstanceStatusData = "stopped" | "starting" | "running" | "pending"; //TODO: implement "stopping"
export type RunnerData = "start" | "stop" | "restart";

function parse(message: string): Message | null {
  try {
    const parsed = JSON.parse(message);
    if (typeof parsed !== "object" || parsed === null) return null;

    const { type, data } = parsed as Message;

    if (typeof type !== "string") return null;

    return { type, data };
  } catch (_e) {
    return null;
  }
}

export { parse };
