export type Message =
  | {
      type: "error";
      data: string;
    }
  | {
      type: "ping";
      data: PingData;
    }
  | {
      type: "pong";
      data: PongData;
    }
  | {
      type: "connected";
      data: ConnectedData;
    }
  | {
      type: "instance_status";
      data: InstanceStatusData;
    }
  | {
      type: "runner";
      data: RunnerData;
    }
  | {
      type: "mc_cmd";
      data: McCmdData;
    }
  | {
      type: "instance_stdout";
      data: InstanceStdoutData;
    }
  | {
      type: "instance_players";
      data: InstancePlayerData;
    }
  | {
      type: "jars_change";
      data: JarsChangeData;
    };

export type PingData = { timestamp: string };
export type PongData = { timestamp: string };
export type ConnectedData = { id: string; timestamp: string };
export type InstanceStatusData = "stopped" | "starting" | "running" | "pending"; //TODO: implement "stopping"
export type RunnerData = "start" | "stop" | "restart";
export type McCmdData = string;
export type InstanceStdoutData = string;
export type InstancePlayerData = string[];
export type JarsChangeData =
  | { initialState: string[] }
  | { jarName: string; action: "add" | "delete" | "set" };

function parse(message: string): Message | null {
  try {
    const parsed = JSON.parse(message);
    if (typeof parsed !== "object" || parsed === null) return null;

    const { type, data } = parsed as Message;

    if (typeof type !== "string") return null;

    return { type, data } as Message;
  } catch (_e) {
    return null;
  }
}

export { parse };
