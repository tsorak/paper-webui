import {
  Component,
  For,
  Show,
  createEffect,
  createResource,
  createSignal,
} from "solid-js";

import { useMcContext } from "../context/mcContext";

type VersionEntry = {
  id: string;
  type: string;
  url: string;
};

const Versions: Component = () => {
  return (
    <main class="flex flex-wrap gap-2">
      <InstalledJars />
      <JarDownloadForm />
    </main>
  );
};

const InstalledJars: Component = () => {
  const [mcContext, mutMcContext] = useMcContext();
  const installedVersions = () => mcContext.jars.installed;
  const activeJar = () => mcContext.jars.activeJar;

  async function getInstalledServers() {
    const res = await fetch("/installed_versions");
    if (!res.ok) return { versions: [], activeJar: "" };

    const data = (await res.json()) as {
      versions: string[];
      activeJar: string;
    };
    return data;
  }

  const [fetchedVersions] = createResource(getInstalledServers);

  const isCurrentJar = (jarName: string) => activeJar() === jarName;

  const setActiveVersion = async (version: string) => {
    const res = await fetch("/installed_versions", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jarName: version }),
    });
    if (!res.ok) return;

    mutMcContext("jars", "activeJar", version);
  };

  createEffect(() => {
    if (fetchedVersions.state === "ready") {
      const { versions, activeJar } = fetchedVersions();
      mutMcContext("jars", "installed", new Set(versions));
      mutMcContext("jars", "activeJar", activeJar);
    }
  });

  //   createEffect(() => {
  //     console.log("installedVersions", installedVersions());
  //     console.log("activeJar", activeJar());
  //   });

  //
  return (
    <div class="select-none flex flex-col gap-2 leading-none bg-white p-2 rounded-md flex-grow">
      <h2 class="text-lg font-semibold">Installed Servers</h2>
      <div class="border-b" />
      <ul class="flex flex-col gap-2 break-keep">
        <For each={Array.from(installedVersions())}>
          {(server) => (
            <li class="flex justify-between items-center h-6">
              <p>{server}</p>
              <Show
                when={!isCurrentJar(server)}
                fallback={<span class="text-lime-600 mr-2">(current)</span>}
              >
                <div class="flex gap-2 mr-2">
                  <button
                    onclick={() => setActiveVersion(server)}
                    class="p-1 border-b border-neutral-300 hover:border-neutral-200 hover:bg-neutral-200 transition-colors"
                  >
                    Use
                  </button>
                  <button class="p-1 border-b border-neutral-300 hover:border-neutral-200 hover:bg-neutral-200 transition-colors">
                    Remove
                  </button>
                </div>
              </Show>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};

const getServerTypes = async (): Promise<string[]> => {
  const res = await fetch("/version");
  if (!res.ok) return [];

  const data = await res.json();
  return data;
};

const JarDownloadForm: Component = () => {
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ serverType, serverVersion, submitType }),
    });

    form.reset();
    setServerVersions([]);
    if (!res.ok) return;

    const data = (await res.json()) as { url: string; name: string };
    console.log("Adding jar", data);

    const [_, mutMcContext] = useMcContext();
    mutMcContext("jars", "activeJar", data.name);
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ serverType: selectedValue }),
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
    <form onSubmit={handleSubmit} class="flex-grow">
      <div class="select-none flex flex-col gap-2 leading-none bg-white p-2 rounded-md">
        <h3 class="text-lg font-semibold">Server Downloader</h3>
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
            class="p-2 rounded-md border border-neutral-300 hover:border-sky-100 hover:bg-sky-100 transition-colors"
          >
            Download
          </button>
          <button
            type="submit"
            value="use"
            class="p-2 rounded-md border border-neutral-300 hover:border-sky-100 hover:bg-sky-100 transition-colors"
          >
            Download & Use
          </button>
        </div>
      </div>
    </form>
  );
};

export default Versions;
