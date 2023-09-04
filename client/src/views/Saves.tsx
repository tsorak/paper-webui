import { Component, For, Setter, createResource, createSignal } from "solid-js";

const Saves: Component = () => {
  const [selectedSave, setSelectedSave] = createSignal<string | null>(null, {
    equals(prev, next) {
      removeSelectedClass(prev);
      addSelectedClass(next);
      return prev === next;
    },
  });

  const [saves, { mutate: mutSaves }] = createResource(fetchSaves);

  function addSelectedClass(id: string | null) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.classList.add("bg-gray-100");
  }

  function removeSelectedClass(id: string | null) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.classList.remove("bg-gray-100");
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (!selectedSave()) return;

    const submitMode = determineSubmitMode(e.submitter as HTMLInputElement);

    const body = {
      kind: submitMode,
      props: {
        name: selectedSave(),
      },
    };

    makeApiRequest(body);
  }

  return (
    <main class="flex flex-col gap-2">
      <form class="p-2 bg-white rounded-md self-start" onSubmit={handleSubmit}>
        <Toolbar />
      </form>
      <div class="p-2 bg-white rounded-md">
        <table class="w-full table-auto">
          <thead class="border-b border-gray-200">
            <tr class="text-left">
              <th>Name</th>
              <th>Server Version</th>
              <th>Created</th>
              {/* <th>Size</th> */}
            </tr>
          </thead>
          <tbody class="border-b border-gray-200">
            <For each={saves()?.saves} fallback={null}>
              {(save, i) => {
                const isLast = () => i() === saves.length - 1;
                const props = { ...save, setSelectedSave, isLast };
                return <WorldRow {...props} />;
              }}
            </For>
          </tbody>
        </table>
      </div>
    </main>
  );
};

const WorldRow: Component<{
  worldId?: string;
  name: string;
  version: string;
  created: string;
  setSelectedSave: Setter<string>;
  isLast: () => boolean;
}> = (props) => {
  const { name, version, created, setSelectedSave, isLast } = props;
  const worldId = props.worldId || name;

  return (
    <tr
      id={worldId}
      class={`cursor-pointer ${
        isLast() === false ? "border-b border-gray-200" : ""
      }`}
      onClick={() => setSelectedSave(worldId)}
    >
      <td ondblclick={() => console.log(`rename mode active for ${name}`)}>
        {name}
      </td>
      <td>{version}</td>
      <td>{created}</td>
    </tr>
  );
};

const Toolbar: Component = () => {
  const btnStyle =
    "bg-sky-100 px-2 py-1 text-blue-400 rounded font-semibold cursor-pointer hover:bg-blue-200 hover:text-blue-500 transition-colors";

  return (
    <div class="flex gap-2">
      <input type="submit" class={btnStyle} value="Load" />
      <input type="submit" class={btnStyle} value="Delete" />
      <input type="submit" class={btnStyle} value="Clone" />
      <input type="submit" class={btnStyle} value="Download" />
    </div>
  );
};

async function fetchSaves() {
  const res = await fetch("/world");

  if (!res.ok) return [];
  return await res.json();
}

const determineSubmitMode = (submitter: HTMLInputElement) => {
  const submitMode = submitter.value.toLowerCase();
  return submitMode as "load" | "delete" | "clone" | "download";
};

async function makeApiRequest(body: Record<string, unknown>) {
  const res = await fetch("/world", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(res.ok, res);

    // notify_ui.slide("error", "Something went wrong");

    return;
  }

  console.log(res.ok, await res.json());
}

export default Saves;
