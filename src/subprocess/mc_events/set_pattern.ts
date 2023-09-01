import {
  PlayerSentMessage,
  ServerSentMessage,
} from "@/src/subprocess/mc_events/types.ts";
import * as trigger_maps from "@/src/subprocess/mc_events/trigger_maps.ts";

function setPlayerCommand(
  specifier: string | string[],
  handler: (data: PlayerSentMessage) => void
): void {
  if (Array.isArray(specifier)) {
    return specifier.forEach((cmd) => setPlayerCommand(cmd, handler));
  }
  trigger_maps.playerCommandHandlers.set(specifier, handler);
}

function setServerMessageTrigger(
  specifier: string,
  handler: (data: ServerSentMessage) => void
): void {
  trigger_maps.serverMessageHandlers.set(specifier, handler);
}

function removePlayerCommand(playerCommand: string) {
  return trigger_maps.playerCommandHandlers.delete(playerCommand);
}

function removeServerMessageTrigger(serverMessage: string) {
  return trigger_maps.serverMessageHandlers.delete(serverMessage);
}

export {
  setPlayerCommand,
  setServerMessageTrigger,
  removePlayerCommand,
  removeServerMessageTrigger,
};
