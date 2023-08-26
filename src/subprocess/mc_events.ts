import { determineEventType } from "@/src/subprocess/mc_events/lineParser.ts";
import * as event_maps from "@/src/subprocess/mc_events/map.ts";

export {
  setPlayerCommandListener,
  removePlayerCommandListener,
  setServerMessageListener,
  removeServerMessageListener,
} from "@/src/subprocess/mc_events/setPattern.ts";

const handleMcOutput = (line: string): void => {
  const event = determineEventType(line);

  if (event.type === "player") {
    if (event.data.command) {
      const matchedFn = event_maps.playerCommandHandlers.get(
        event.data.command.commandName
      );
      if (matchedFn) return matchedFn(event.data);
    }
  } else if (event.type === "server") {
    for (const [pattern, handler] of event_maps.serverMessageHandlers) {
      if (line.includes(pattern)) {
        handler(event.data);
      }
    }
  }
};

export { handleMcOutput };
