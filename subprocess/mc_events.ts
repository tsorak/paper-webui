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

const handleMcOutput = (line: string): void => {
  matchAgainstPattern(line);
};

const matchAgainstPattern = (line: string) => {
  for (const [pattern, event] of MCLogEvents) {
    if (line.includes(pattern)) {
      event.handler(line);
    }
  }
};

function setPatternListener(
  pattern: string,
  handler: MCLogEvent["handler"],
  name = ""
): void {
  MCLogEvents.set(pattern, { name, handler });
}

export { handleMcOutput, MCLogEvents, setPatternListener };
