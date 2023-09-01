import {
  PlayerSentMessage,
  ServerSentMessage,
} from "@/src/subprocess/mc_events/types.ts";

import * as player_parser from "@/src/subprocess/mc_events/player_parser.ts";

function determineEventType(line: string): "player" | "server" | "other" {
  if (!lineHasLogLevel(line)) return "other";

  if (isPlayerSentMessage(line)) {
    return "player";
  } else {
    return "server";
  }
}

function isPlayerSentMessage(line: string): boolean {
  const [_logLevel, rest] = separateAfterLogLevel(line);

  return player_parser.check.startsWithNametag(rest);
}

// function isServerSentMessage(line: string): boolean {
//   //
// }

function lineHasLogLevel(line: string): boolean {
  return line.search(/^\[(\d{2}:\d{2}:\d{2})\ \w+\]/gim) === 0;
}

/**
 * @example separateAfterLogLevel("[13:37:00 INFO]: <Notch> !echo Hello World!")
 * //=> ["[13:37:00 INFO]", "<Notch> !echo Hello World!"]
 */
function separateAfterLogLevel(line: string): [string, string] {
  const splits = line.split("]: ");

  const logLevel = splits.shift()!;
  const rest = splits.join("]: ");

  return [logLevel, rest];
}

/**
 * @example parsePlayerSentMessage("[13:37:00 INFO]: <Notch> !echo Hello World!")
 * //=> { playername: "Notch", message: "!echo Hello World!", timestamp: "", command: { commandName: "echo", args: ["Hello", "World!"] } }
 */
function parsePlayerMessage(line: string): PlayerSentMessage {
  const [_logLevel, rest] = separateAfterLogLevel(line);

  const playername = player_parser.get.nametag(rest);
  const playerMessage = player_parser.get.message(rest);

  if (!player_parser.check.isCommand(playerMessage)) {
    return { playername, message: playerMessage, timestamp: "" };
  }

  const commandName = player_parser.get.commandName(playerMessage);
  const commandArgs = player_parser.get.commandArgs(playerMessage);

  const command = {
    commandName,
    args: commandArgs,
  };

  return { playername, message: playerMessage, timestamp: "", command };
}

function parseServerMessage(line: string): ServerSentMessage {
  const [_logLevel, rest] = separateAfterLogLevel(line);

  return { message: rest, timestamp: "" };
}

export { determineEventType, parsePlayerMessage, parseServerMessage };
