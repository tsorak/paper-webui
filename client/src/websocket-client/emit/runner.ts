import { CS } from "../socket";

const start = (s: CS) => {
  s.json({ type: "runner", data: "start" });
};

const restart = (s: CS) => {
  s.json({ type: "runner", data: "restart" });
};

const stop = (s: CS) => {
  s.json({ type: "runner", data: "stop" });
};

export { start, restart, stop };
