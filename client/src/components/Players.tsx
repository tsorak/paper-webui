import { Component, For, createSignal } from "solid-js";
import { useMcContext } from "../context/mcContext";

const Players: Component = () => {
  const [mc] = useMcContext();

  const onlinePlayers = () => mc.mcInstance.players.length;
  const [maxPlayers, setMaxPlayers] = createSignal(20);
  //

  const ratio = () => `${onlinePlayers()} / ${maxPlayers()}`;

  return (
    <div class="bg-white p-2 rounded-md flex flex-col basis-1/2 min-h-[6rem] h-full">
      <p>Players Online {ratio()}</p>
      <div class="border-t my-1" />
      <div class="ml-1 text-[0.95rem] overflow-y-auto">
        <For each={mc.mcInstance.players}>{(name) => <p>{name}</p>}</For>
      </div>
    </div>
  );
};

export default Players;
