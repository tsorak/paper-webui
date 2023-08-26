import {
  PlayerSentMessage,
  ServerSentMessage,
} from "@/src/subprocess/mc_events/types.ts";

function determineEventType(line: string):
  | {
      type: "player";
      data: PlayerSentMessage;
    }
  | {
      type: "server";
      data: ServerSentMessage;
    }
  | {
      type: "other";
      data: string;
    } {
  const playerMessage = tryParseAsPlayerSentMessage(line);
  const serverMessage = tryParseAsServerSentMessage(line);

  if (playerMessage) {
    return { type: "player", data: playerMessage };
  } else if (serverMessage) {
    return { type: "server", data: serverMessage };
  } else {
    return { type: "other", data: line };
  }
}

function tryParseAsPlayerSentMessage(
  line: string
): PlayerSentMessage | undefined {
  const lineInfo = line.split("]: ")[0];

  const splits = line.split("]: ");
  splits.shift();
  const lineContent = splits.join("]: ");
  if (lineInfo && lineContent?.startsWith("<")) {
    const nametagStart = lineContent.indexOf("<");
    const nametagEnd = lineContent.indexOf(">");
    const playername = lineContent.substring(nametagStart + 1, nametagEnd);

    const message = lineContent.substring(nametagEnd + 2).trim();

    if (!message.startsWith("!")) return { playername, message, timestamp: "" };

    const spaceSplits = message.split(" ");
    // The ! operator is used since we know the first index of `spaceSplits` will be at least "!".
    const commandName = spaceSplits.shift()!.substring(1) || undefined;
    if (!commandName) return { playername, message, timestamp: "" };
    const args = spaceSplits;

    const command = {
      commandName,
      args,
    };

    return { playername, message, timestamp: "", command };
  }

  return undefined;
}

function tryParseAsServerSentMessage(
  line: string
): ServerSentMessage | undefined {
  const lineInfo = line.split("]: ")[0];

  const splits = line.split("]: ");
  splits.shift();
  const lineContent = splits.join("]: ");
  if (lineInfo && lineContent) {
    const message = lineContent;

    return { message, timestamp: "" };
  }
}

export {
  determineEventType,
  tryParseAsPlayerSentMessage,
  tryParseAsServerSentMessage,
};
