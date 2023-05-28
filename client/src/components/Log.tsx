import { Component, createEffect, createResource, For } from "solid-js";

const getLog = async () => {
  const res = await fetch("/logs/latest.log");
  const log = await res.text();
  return log.split("\n");
};

const Log: Component = (p) => {
  let scrollRef: HTMLDivElement;
  const [msgs, {}] = createResource(getLog);

  createEffect(() => {
    msgs();
    scrollRef.scrollTop = scrollRef.scrollHeight;
  });

  return (
    <div
      class="flex-grow h-0 overflow-auto font-mono rounded-md bg-white p-2 leading-none"
      ref={scrollRef}
    >
      <For each={msgs()} fallback={<p>Loading...</p>}>
        {(msg) => <p class="text-sm">{msg}</p>}
      </For>
    </div>
  );
};

export default Log;
