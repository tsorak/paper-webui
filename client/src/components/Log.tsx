import { Component, createEffect, For, onCleanup, onMount } from "solid-js";
import { useMcContext } from "../context/mcContext";

const getLog = async () => {
  const res = await fetch("/logs/latest.log");
  const log = await res.text();
  return log.split("\n");
};

const Log: Component = (p) => {
  let scrollRef: HTMLDivElement;
  const [mc, setMc] = useMcContext();
  const msgs = () => mc.mcInstance.stdout_lines;

  // autoscroll
  createEffect(() => {
    msgs();
    scrollRef.scrollTop = scrollRef.scrollHeight;
  });
  // clean on starting
  // createEffect(() => {
  //   if (mc.mcInstance.status === "starting") {
  //     setMc("mcInstance", "stdout_lines", []);
  //   }
  // });

  onMount(() => {
    getLog().then((log) => {
      setMc("mcInstance", "stdout_lines", log);
    });
  });

  onCleanup(() => {
    setMc("mcInstance", "stdout_lines", []);
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
