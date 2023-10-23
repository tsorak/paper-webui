import { Accessor, For } from "solid-js";
import type { SaveEntry } from "../../context/mcContext";

export default function DeletedSavesTable({
  data,
}: {
  data: Accessor<SaveEntry[]>;
}) {
  return (
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-200 text-sm text-left uppercase">
          <th class="font-medium px-1">Name</th>
          <th class="font-medium px-1">Version</th>
        </tr>
      </thead>
      <tbody>
        <For each={data()}>
          {(save) => {
            return (
              <tr class="border-b border-gray-200">
                <td class="px-2">{save.name}</td>
                <td class="px-2">{save.jar}</td>
              </tr>
            );
          }}
        </For>
      </tbody>
    </table>
  );
}
