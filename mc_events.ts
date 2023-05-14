import * as log from "./log.ts";

type MCLogPattern = string;
export interface MCLogEvent {
  name: string;
  handler: (message: string) => void;
}

const MCLogEvents: Map<MCLogPattern, MCLogEvent> = new Map();

// MCLogEvents.set("]: Done (", {
//   name: "server-started",
//   handler: (message: string) => {
//     //send to webui
//     log.out("SERVER STARTED LUL!");
//     log.save("SERVER STARTED LUL!\n");
//   }
// });

const handleMcOutput = (chunk: Uint8Array): void => {
  const line = parseMcOutput(chunk);

  log.saveRaw(line);

  matchAgainstPattern(line);
};

const parseMcOutput = (chunk: Uint8Array): string => {
  const line = new TextDecoder().decode(chunk);
  return line;
};

const matchAgainstPattern = (line: string) => {
  for (const [pattern, event] of MCLogEvents) {
    if (line.includes(pattern)) {
      event.handler(line);
    }
  }
};

export default handleMcOutput;
export { MCLogEvents };
