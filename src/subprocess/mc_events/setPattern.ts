import {
  PlayerSentMessage,
  ServerSentMessage,
} from "@/src/subprocess/mc_events/types.ts";
import * as event_maps from "@/src/subprocess/mc_events/map.ts";

function setPlayerCommand(
  specifier: string | string[],
  handler: (data: PlayerSentMessage) => void
): void {
  if (Array.isArray(specifier)) {
    return specifier.forEach((cmd) => setPlayerCommand(cmd, handler));
  }
  event_maps.playerCommandHandlers.set(specifier, handler);
}

function setServerMessageTrigger(
  specifier: string,
  handler: (data: ServerSentMessage) => void
): void {
  event_maps.serverMessageHandlers.set(specifier, handler);
}

function removePlayerCommand(playerCommand: string) {
  return event_maps.playerCommandHandlers.delete(playerCommand);
}

function removeServerMessageTrigger(serverMessage: string) {
  return event_maps.serverMessageHandlers.delete(serverMessage);
}

export {
  setPlayerCommand,
  setServerMessageTrigger,
  removePlayerCommand,
  removeServerMessageTrigger,
};
