import { Accessor, createSignal } from "solid-js";

function createPromise() {
  let resolve: Function, reject: Function;

  let promise: Promise<void> = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    innerPromise: promise,
    wait: () => promise,
    controls: {
      resolve,
      reject,
    },
  };
}

type ResetFunction = () => void;

export default function createPromiseSignal(): [
  Accessor<ReturnType<typeof createPromise>>,
  ResetFunction
] {
  const [promise, setPromise] = createSignal(createPromise());

  const reset = () => {
    setPromise(createPromise());
  };

  return [promise, reset];
}
