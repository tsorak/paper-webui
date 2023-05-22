const runner_cmd_queue: string[] = [];
const stdin_queue: string[] = [];
export const stdout_queue: string[] = [];

export const mc = {
  sendCMD: (s: string) => stdin_queue.push(s),
  pop: () => stdin_queue.shift(),
  push: (s: string) => stdin_queue.push(s)
};

export const rnr = {
  pop: () => runner_cmd_queue.shift(),
  push: (s: string) => runner_cmd_queue.push(s)
};
