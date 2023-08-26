import {
  PlayerSentMessage,
  ServerSentMessage,
} from "@/src/subprocess/mc_events/types.ts";

const playerCommandHandlers: Map<string, (message: PlayerSentMessage) => void> =
  new Map();
const serverMessageHandlers: Map<string, (message: ServerSentMessage) => void> =
  new Map();

export { playerCommandHandlers, serverMessageHandlers };
