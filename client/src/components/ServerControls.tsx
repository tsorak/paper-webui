import { Component, createSignal } from "solid-js";

import ServerStatus from "./ServerStatus";

export const [dropped, setDropped] = createSignal(false);

const ServerControls: Component = () => {
  function handleClick() {
    setDropped((prev) => !prev);
  }

  return (
    <>
      <div class="relative flex">
        <button
          class="flex items-center rounded-md overflow-hidden h-6"
          onclick={handleClick}
        >
          <ServerStatus />
          <div class="relative w-6 bg-white leading-none h-full">
            <span class="absolute text-gray-500 -translate-x-1/2 -top-[5px] h-full text-2xl select-none pointer-events-none">
              <span
                class="absolute -left-[9px] transition-transform duration-300"
                style={{
                  transform: dropped() ? "rotate(90deg) translate(2px)" : "none"
                }}
              >
                {"▸"}
              </span>
            </span>
          </div>
        </button>
        <Dropdown />
      </div>
      {dropped() && <Deselector />}
    </>
  );
};

const Dropdown: Component = () => {
  return (
    <div
      class="absolute z-10 w-[120px] right-0 mt-8 bg-white text-gray-500 rounded-md p-1 flex flex-col transition-transform origin-top gap-1"
      style={{
        transform: dropped() ? "rotateX(0deg)" : "rotateX(90deg)"
      }}
    >
      <button class="p-2 hover:bg-sky-100 hover:text-sky-600 rounded-md text-left transition-colors">
        Start
      </button>
      <button class="p-2 hover:bg-sky-100 hover:text-sky-600 rounded-md text-left transition-colors">
        Restart
      </button>
      <button class="p-2 hover:bg-sky-100 hover:text-sky-600 rounded-md text-left transition-colors">
        Stop
      </button>
    </div>
  );
};

const Deselector: Component = () => {
  function handleClick() {
    setDropped(false);
  }

  return (
    <div
      onclick={handleClick}
      class="absolute w-screen h-screen left-0 top-0"
    />
  );
};

export default ServerControls;
