import { Component, createEffect, createResource, For } from "solid-js";

const getLog = async () => {
  const res = await fetch("/logs/latest.log");
  const log = await res.text();
  return log.split("\n");
};

const Shell: Component = (p) => {
  let scrollRef: HTMLDivElement;
  const [msgs, {}] = createResource(getLog);

  createEffect(() => {
    msgs();
    scrollRef.scrollTop = scrollRef.scrollHeight;
  });

  return (
    <div class="rounded-md bg-white flex-grow mb-4 p-2 leading-none font-mono flex flex-col gap-2">
      <div class="flex-grow h-0 overflow-auto" ref={scrollRef}>
        <For each={msgs()} fallback={<p>Loading...</p>}>
          {(msg) => <p class="text-sm">{msg}</p>}
        </For>
      </div>
      <form class="flex">
        <span>{">"}</span>
        <input type="text" class="w-full" />
      </form>
    </div>
  );
};

export default Shell;
