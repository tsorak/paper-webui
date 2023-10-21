import s, { emit } from "../socket";

let resolve: Function;

let untilStopped: Promise<void> = new Promise((res) => {
  resolve = res;
});

function reset() {
  untilStopped = new Promise((res) => {
    resolve = res;
  });
}

async function ensureStopped() {
  emit.runner.stop(s.instance);
  return await untilStopped;
}

export { ensureStopped as default, untilStopped as rawPromise, resolve, reset };
