import {
  determineEventType,
  parsePlayerMessage,
  parseServerMessage,
} from "@/src/subprocess/mc_events/line_parser.ts";
import * as event_maps from "@/src/subprocess/mc_events/trigger_maps.ts";

const handleMcOutput = (line: string): void => {
  const eventType = determineEventType(line);

  if (eventType === "player") {
    handlePlayerMessage(line);
  } else if (eventType === "server") {
    handleServerMessage(line);
  }
};

function handlePlayerMessage(line: string) {
  const playerMessage = parsePlayerMessage(line);
  if (!playerMessage.command) return;

  const commandName = playerMessage.command.commandName;
  const matchedFn = findMatchingCommandHandler(commandName);
  if (matchedFn) matchedFn(playerMessage);
}

function findMatchingCommandHandler(commandName: string) {
  return event_maps.playerCommandHandlers.get(commandName);
}

function handleServerMessage(line: string) {
  const serverMessage = parseServerMessage(line);

  const matchedFn = findMatchingServerMessageHandler(serverMessage.message);
  if (matchedFn) return matchedFn(serverMessage);
}

function findMatchingServerMessageHandler(message: string) {
  for (const [pattern, handler] of event_maps.serverMessageHandlers) {
    if (message.includes(pattern)) {
      return handler;
    }
  }
}

export { handleMcOutput };

export {
  setPlayerCommand,
  removePlayerCommand,
  setServerMessageTrigger,
  removeServerMessageTrigger,
} from "@/src/subprocess/mc_events/set_pattern.ts";
