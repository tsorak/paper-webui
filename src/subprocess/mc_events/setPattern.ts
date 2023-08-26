import {
  PlayerSentMessage,
  ServerSentMessage,
} from "@/src/subprocess/mc_events/types.ts";
import * as event_maps from "@/src/subprocess/mc_events/map.ts";

function setPlayerCommandListener(
  specifier: string | string[],
  handler: (data: PlayerSentMessage) => void
): void {
  if (Array.isArray(specifier)) {
    return specifier.forEach((cmd) => setPlayerCommandListener(cmd, handler));
  }
  event_maps.playerCommandHandlers.set(specifier, handler);
}

function setServerMessageListener(
  specifier: string,
  handler: (data: ServerSentMessage) => void
): void {
  event_maps.serverMessageHandlers.set(specifier, handler);
}

function removePlayerCommandListener(playerCommand: string) {
  return event_maps.playerCommandHandlers.delete(playerCommand);
}

function removeServerMessageListener(serverMessage: string) {
  return event_maps.serverMessageHandlers.delete(serverMessage);
}

export {
  setPlayerCommandListener,
  setServerMessageListener,
  removePlayerCommandListener,
  removeServerMessageListener,
};
