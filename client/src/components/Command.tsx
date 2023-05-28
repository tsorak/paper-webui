import { Component } from "solid-js";
import s, { emit } from "../websocket-client/socket";
import { useMcContext } from "../context/mcContext";

const Command: Component = () => {
  const [mcContext] = useMcContext();
  const notRunning = () => mcContext.mcInstance.status !== "running";

  let inputEl: HTMLInputElement | undefined;

  //   TODO: Implement command history
  //   onMount(() => {
  //     inputEl.onkeydown = (e: KeyboardEvent) => {
  //       if (e.key === "ArrowUp") {
  //         console.log("ArrowUp");
  //       }
  //       if (e.key === "ArrowDown") {
  //         console.log("ArrowDown");
  //       }
  //     };
  //   });

  //   onCleanup(() => {
  //     inputEl.onkeydown = null;
  //   });

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const command = new FormData(form).get("pwebui_command_elem");
    if (!command) return;
    inputEl.value = "";

    emit.mc.command(s.instance, `${command}`.trim());
  };

  return (
    <form
      class="flex leading-none bg-white rounded-md p-1"
      onsubmit={handleSubmit}
      style={{ background: notRunning() ? "#fbfbfbaa" : "none" }}
    >
      <span class="translate-y-[1px] select-none">{">"}</span>
      <input
        ref={inputEl}
        type="text"
        name="pwebui_command_elem"
        autocomplete="off"
        autocorrect="off"
        spellcheck={false}
        class="w-full bg-transparent focus:outline-none placeholder:font-light font-mono"
        disabled={notRunning()}
        placeholder={
          notRunning() ? "Instance unavailable..." : "Enter a command..."
        }
      />
    </form>
  );
};

export default Command;
