import { Component, createSignal, onMount } from "solid-js";
import Log from "../components/Log";
import Command from "../components/Command";
import Players from "../components/Players";

const [h, setH] = createSignal(0);

const Overview: Component = () => {
  return (
    <main class="flex flex-col gap-2 flex-grow backdrop:opacity-10 break-all">
      <div class="flex flex-col h-full gap-2">
        <div
          class="upper flex justify-between gap-2"
          style={{ height: `${h()}px` }}
        >
          <Players />
          <div class="basis-1/2" />
          {/* <OsResourceStats /> */}
        </div>
        <Resizer />
        <div class="flex-grow flex flex-col gap-2">
          <Log />
          <Command />
        </div>
      </div>
    </main>
  );
};

const Resizer: Component = () => {
  const [holding, setHolding] = createSignal(false);
  let resizeElem: HTMLDivElement | undefined;

  onMount(() => {
    const upper = document.querySelector(".upper") as HTMLDivElement;

    setH(upper.scrollHeight);
    resizeElem!.addEventListener("mousedown", (e) => {
      console.log("mousedown");
      setHolding(true);
      resizeElem!.onmousemove = (e) => {
        setH(
          Math.min(
            Math.max(e.clientY - (upper.offsetTop + 7), 96),
            window.innerHeight - 200
          )
        );
      };
    });
    resizeElem!.addEventListener("mouseup", (e) => {
      setHolding(false);
      console.log("mouseup");
      resizeElem!.onmousemove = null;
    });
  });

  return (
    <div class="h-0" ref={resizeElem}>
      <div class="flex items-center justify-center w-12 h-2 mx-auto bg-neutral-300 -translate-y-1/2 rounded-full transition-all hover:h-4 cursor-pointer select-none">
        <span class="flex w-min -translate-y-[2px] scale-x-[2] text-neutral-500">
          ≡
        </span>
      </div>
      <div
        class="absolute w-full h-full top-0 left-0 cursor-ns-resize"
        style={{ display: holding() ? "" : "none" }}
      ></div>
    </div>
  );
};

const OsResourceStats: Component = () => (
  <div class="os-resource-stats flex h-20 gap-4">
    <div class="bg-white flex-grow rounded-md" />
    <div class="bg-white flex-grow rounded-md" />
    <div class="bg-white flex-grow rounded-md" />
    <div class="bg-white flex-grow rounded-md" />
  </div>
);

export default Overview;
