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

// function formatLine(line: string): { timestamp: string; user: string; message: string } {
//   const timestamp = line.split("[")[1].split("]")[0];
//   const username =
// }

const matchAgainstPattern = (line: string) => {
  for (const [pattern, event] of MCLogEvents) {
    if (line.includes(pattern)) {
      event.handler(line);
    }
  }
};

function setPatternListener(
  pattern: string | string[],
  handler: MCLogEvent["handler"],
  name = ""
): void {
  if (Array.isArray(pattern)) {
    pattern.forEach((p) => setPatternListener(p, handler, name));
  } else {
    MCLogEvents.set(pattern, { name, handler });
  }
}

function removePatternListener(pattern: string): void {
  MCLogEvents.delete(pattern);
}

export {
  handleMcOutput,
  MCLogEvents,
  setPatternListener,
  removePatternListener,
};
