import { Component, For, createResource, createSignal } from "solid-js";

type VersionEntry = {
  id: string;
  type: string;
  url: string;
};

const getServerTypes = async (): Promise<string[]> => {
  const res = await fetch("/version");
  if (!res.ok) return [];

  const data = await res.json();
  return data;
};

const Versions: Component = () => {
  const [serverTypes] = createResource(getServerTypes);
  const [stableOnly, setStableOnly] = createSignal(true);
  const [serverVersions, setServerVersions] = createSignal<VersionEntry[]>([]);
  const versions = () => {
    if (stableOnly()) {
      return serverVersions().filter((v) => v.type === "release");
    }
    return serverVersions();
  };

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    console.log(e);

    const form = e.target as HTMLFormElement;
    const formFields = form.elements;

    const submitType = (e.submitter as HTMLButtonElement).value;
    const serverType = (formFields.item(0) as HTMLSelectElement)
      .selectedOptions[0].value;
    const serverVersion = (formFields.item(1) as HTMLSelectElement)
      .selectedOptions[0].value;

    console.log({ serverType, submitType, serverVersion });

    const res = await fetch("/version", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ serverType, serverVersion, submitType })
    });

    form.reset();
    setServerVersions([]);
    if (!res.ok) return;

    const data = (await res.json()) as { url: string; name: string };
    console.log("Adding jar", data);
  }

  async function handleServerTypeChange(e: Event) {
    const t = e.target as HTMLSelectElement;
    const selectedValue = t.selectedOptions[0].value as
      | ""
      | "vanilla"
      | "papermc";

    const res = await fetch("/version", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ serverType: selectedValue })
    });
    if (!res.ok) return setServerVersions([]);

    const data = (await res.json()) as VersionEntry[];
    setServerVersions(data);
  }

  const stableOnlyHandler = (e: Event) => {
    const t = e.target as HTMLInputElement;
    setStableOnly(t.checked);
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <div class="select-none flex flex-col gap-2 leading-none bg-white p-2 rounded-md">
          <div class="flex gap-2">
            <select
              name="server-type"
              class="text-center bg-transparent border-b-2 border-dashed border-gray-300"
              onchange={handleServerTypeChange}
            >
              <option value="">--Server type--</option>
              <For each={serverTypes()}>
                {(type) => <option value={type}>{type}</option>}
              </For>
            </select>
            <select
              name="server-version"
              class="bg-transparent border-b-2 border-dashed border-gray-300"
              disabled={!serverVersions().length}
            >
              <option value="">--Server version--</option>
              <For each={versions()}>
                {(version) => <option value={version.id}>{version.id}</option>}
              </For>
            </select>
          </div>
          <div class="flex items-center gap-1">
            <input
              type="checkbox"
              id="stable_only"
              checked
              onchange={stableOnlyHandler}
            />
            <label for="stable_only">Stable versions only</label>
          </div>
          <div class="flex gap-2">
            <button
              type="submit"
              value="download"
              class="p-1 bg-neutral-200 rounded-sm border border-neutral-400 hover:bg-neutral-100"
            >
              Download
            </button>
            <button
              type="submit"
              value="use"
              class="p-1 bg-neutral-200 rounded-sm border border-neutral-400 hover:bg-neutral-100"
            >
              Use
            </button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default Versions;
