import { Component, For, Setter, Show, createSignal } from "solid-js";
import { useMcContext } from "../context/mcContext";
import BackupModal from "../components/saves/BackupModal";
import { notificationService } from "@hope-ui/solid";
import { postToWorldAPI } from "../communication/postToWorldAPI";
import ShutdownOptionModal from "../components/ShutdownOptionModal";
import createPromiseSignal from "../utils/createPromiseSignal";
import { WorldBody } from "../../../src/webui/validators/world_validator";
import CloneModal from "../components/saves/CloneModal";
import DeleteConfirmationModal from "../components/saves/DeleteConfirmation";
import DeletedSavesTable from "../components/saves/DeletedSavesTable";
import createCachedSignal from "../utils/cachedSignal";
import SavesSettings from "../components/saves/SavesSettings";
import { useSiteSettingsContext } from "../context/siteSettingsContext";

const Saves: Component = () => {
  const [siteSettings] = useSiteSettingsContext();
  const [mcCtx] = useMcContext();
  const saves = () =>
    mcCtx.saves.filter((w) => !w.deleted && w.name !== "world");
  const hasActiveSave = () =>
    mcCtx.saves.findIndex((w) => w.name === "world") > -1;
  const deletedSaves = () => mcCtx.saves.filter((w) => w.deleted);
  const [showDeleted, setShowDeleted] = createCachedSignal(
    false,
    "showDeleted"
  );

  const [shutdownOptionOpen, setShutdownOptionOpen] = createSignal(false);
  const [shutdownOptionDone, resetShutdownOptionDone] = createPromiseSignal();

  const [backupModalOpen, setBackupModalOpen] = createSignal(false);
  const [backupOptionDone, resetBackupOptionDone] = createPromiseSignal();

  const [cloneName, setCloneName] = createSignal("", { equals: false });
  const [cloneModalOpen, setCloneModalOpen] = createSignal(false);
  const [cloneOptionDone, resetCloneOptionDone] = createPromiseSignal();

  const [deleteConfModalOpen, setDeleteConfModalOpen] = createSignal(false);
  const [deleteConfDone, resetDeleteConfDone] = createPromiseSignal();

  const [selectedSave, setSelectedSave] = createSignal<string | null>(null, {
    equals(prev, next) {
      const [prevId, nextId] = [prev, next].map((str) => "save-entry-" + str);
      document.getElementById(prevId)?.classList.remove("bg-gray-100");
      document.getElementById(nextId)?.classList.add("bg-gray-100");
      return prev === next;
    },
  });
  const unselectSave = () => setSelectedSave("");

  async function attemptRescueAction(
    maySubmit: ReturnType<typeof determineActionPossibility> & {
      possible: false;
    }
  ): Promise<{ success: boolean }> {
    const { blockers } = maySubmit;

    const fatalBlockers = blockers.filter((b) => !b.option);
    if (fatalBlockers.length) {
      fatalBlockers.forEach((b) => {
        notificationService.show({
          title: "Error",
          description: b.reason,
          status: "danger",
        });
      });
      return { success: false };
    }

    if (blockers.some((b) => b.option === "stop")) {
      setShutdownOptionOpen(true);
      try {
        console.log("Waiting for user selection...");
        await shutdownOptionDone().wait();
      } catch (_) {
        console.warn("User cancelled server shutdown");
        return { success: false };
      } finally {
        console.log("Resetting shutdownOptionDone");
        resetShutdownOptionDone();
      }
      console.log("User chose to shutdown the server, continuing...");
    }

    if (blockers.some((b) => b.option === "backup")) {
      setBackupModalOpen(true);
      try {
        console.log("Waiting for user selection...");
        await backupOptionDone().wait();
      } catch (_) {
        console.warn("User cancelled backup");
        return { success: false };
      } finally {
        console.log("Resetting backupOptionDone");
        resetBackupOptionDone();
      }
      console.log("Backup form exited successfully, continuing...");
    }

    return { success: true };
  }

  async function additionalUserInput(
    body: WorldBody
  ): Promise<{ success: boolean }> {
    // Have user choose a name for the new save
    if (body.kind === "clone") {
      setCloneModalOpen(true);
      try {
        console.log("Waiting for user selection...");
        await cloneOptionDone().wait();
        body.props.to = cloneName();
      } catch (_) {
        console.warn("User cancelled clone process.");
        console.warn("The following operation has been aborted:", body);
        return { success: false };
      } finally {
        console.log("Resetting cloneOptionDone");
        resetCloneOptionDone();
      }
      console.log("Clone form exited successfully, continuing...");
    }

    // Have user confirm deletion
    if (siteSettings.prompt.delete && body.kind === "delete") {
      setDeleteConfModalOpen(true);
      try {
        console.log("Waiting for user selection...");
        await deleteConfDone().wait();
      } catch (_) {
        console.warn("User denied deletion.");
        console.warn("The following operation has been aborted:", body);
        return { success: false };
      } finally {
        console.log("Resetting deleteConfDone");
        resetDeleteConfDone();
      }
      console.log("Deletion accepted, continuing...");
    }

    return { success: true };
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (!selectedSave()) return;

    const submitMode = determineSubmitMode(e.submitter as HTMLInputElement);

    let body: WorldBody;

    switch (submitMode) {
      case "load": {
        body = {
          kind: submitMode,
          props: {
            name: selectedSave(),
            autoRestart: false,
          },
        };
        break;
      }
      case "delete": {
        body = {
          kind: submitMode,
          props: {
            name: selectedSave(),
          },
        };
        break;
      }
      case "clone": {
        body = {
          kind: submitMode,
          props: {
            name: selectedSave(),
            to: "",
          },
        };
        break;
      }
      case "download": {
        body = {
          kind: submitMode,
          props: {
            name: selectedSave(),
          },
        };
        break;
      }
    }

    const maySubmit = determineActionPossibility(body);
    if (maySubmit.possible === false) {
      const rescue = await attemptRescueAction(maySubmit);
      if (rescue.success) {
        console.log("Rescue action(s) succeeded, continuing...");
      } else {
        console.warn("The following operation has been aborted:", body);
        return;
      }
    }

    const additionalInput = await additionalUserInput(body);
    if (additionalInput.success === false) return;

    console.warn("Submitting the following body:", body);
    await postToWorldAPI(body);
    // reset all inputs
    {
      unselectSave();
      setCloneName("");
    }
  }

  return (
    <>
      <ShutdownOptionModal
        isOpen={shutdownOptionOpen}
        setIsOpen={setShutdownOptionOpen}
        promiseControls={shutdownOptionDone}
      />
      <BackupModal
        modalState={[backupModalOpen, setBackupModalOpen]}
        promiseControls={backupOptionDone}
      />
      <CloneModal
        modalState={[cloneModalOpen, setCloneModalOpen]}
        selectedSave={selectedSave}
        setCloneName={setCloneName}
        promiseControls={cloneOptionDone}
      />
      <DeleteConfirmationModal
        modalState={[deleteConfModalOpen, setDeleteConfModalOpen]}
        toBeDeleted={selectedSave}
        promiseControls={deleteConfDone}
      />
      <main class="flex flex-col gap-2">
        <div class="flex justify-between">
          <form
            class="p-2 bg-white rounded-md self-start"
            onSubmit={handleSubmit}
          >
            <Toolbar />
          </form>
          <SavesSettings />
        </div>
        <div class="p-2 bg-white rounded-md">
          <p class="font-bold border-b border-gray-200">Active save</p>
          <Show
            when={hasActiveSave()}
            fallback={
              <p class="opacity-75 border-b border-gray-200 px-2">
                There is no save loaded
              </p>
            }
          >
            <p
              id={"save-entry-" + "world"}
              class="border-b border-gray-200 px-2 cursor-pointer"
              onClick={() => setSelectedSave("world")}
            >
              world
            </p>
          </Show>
        </div>
        <div class="p-2 bg-white rounded-md">
          <p class="font-bold">Your saves</p>
          <table class="w-full table-auto">
            <thead class="border-b border-gray-200 text-sm">
              <tr class="text-left uppercase">
                <th class="font-medium px-1">Name</th>
                <th class="font-medium px-1">Server Version</th>
                {/* <th>Size</th> */}
              </tr>
            </thead>
            <tbody class="border-b border-gray-200">
              <For each={saves()} fallback={null}>
                {(save, i) => {
                  const isLast = () => i() === saves.length - 1;
                  const props = { ...save, setSelectedSave, isLast };
                  return <WorldRow {...props} />;
                }}
              </For>
            </tbody>
          </table>
        </div>
        <div class="p-2 bg-white rounded-md overflow-hidden">
          <h3
            class="font-bold cursor-pointer"
            onClick={() => setShowDeleted((p) => !p)}
          >
            Deleted saves
          </h3>
          <div class={`${showDeleted() ? "" : "hidden"}`}>
            <DeletedSavesTable data={deletedSaves} />
          </div>
        </div>
      </main>
    </>
  );
};

const WorldRow: Component<{
  name: string;
  jar?: string;
  deleted?: boolean;
  setSelectedSave: Setter<string>;
  isLast: () => boolean;
}> = (props) => {
  const { name, jar, setSelectedSave, isLast } = props;

  return (
    <tr
      id={"save-entry-" + name}
      class={`cursor-pointer ${
        isLast() === false ? "border-b border-gray-200" : ""
      }`}
      onClick={() => setSelectedSave(name)}
    >
      <td class="px-2">{name}</td>
      <td class="px-2">{jar ?? ""}</td>
    </tr>
  );
};

const Toolbar: Component = () => {
  const btnStyle = "px-2 py-1 font-semibold primary-button";

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

  if (!res.ok) return { currentVersion: "", saves: [] };
  return (await res.json()) as {
    currentVersion: string;
    saves: {
      name: string;
      jar?: string;
      deleted?: boolean;
    }[];
  };
}

const determineSubmitMode = (submitter: HTMLInputElement) => {
  const submitMode = submitter.value.toLowerCase();
  return submitMode as "load" | "delete" | "clone" | "download";
};

// Determine whether the action is possible
// by checking factors such as
// - is the instance stopped
// All actions are available when the instance is stopped.
// - is the save in question the current save
// If method is delete the instance has to be stopped.
// - is the save in question any of the backups
// If method is load the instance has to be stopped.
//
// When loading a save always prompt to backup the current save first.
// Delete, Clone and Download are available for backups regardless of
// instance running state.
function determineActionPossibility(body: WorldBody):
  | {
      possible: false;
      blockers: { possible: false; reason: string; option?: string }[];
    }
  | { possible: true } {
  //   throw new Error("Fix mcContext saves first!");
  // setup fs watcher for saves
  // Why? More reliable way of getting the saves.

  // Currently the saves are fetched once when the component is mounted.
  // Updates to the saves are not reflected in the UI.

  const { kind, props } = body;
  const [mcCtx, _] = useMcContext();

  const isInstanceStopped = mcCtx.mcInstance.status === "stopped";
  const isLoadedSaveSelected = props.name === "world";
  const thereIsLoadedSave = !!mcCtx.saves.find((w) => w.name === "world");

  const blockers: {
    possible: false;
    reason: string;
    option?: string;
  }[] = [];

  if (kind === "load" && isLoadedSaveSelected) {
    blockers.push({
      possible: false,
      reason: "The selected save is already loaded",
    });
  }
  if (kind === "load" && !isInstanceStopped) {
    blockers.push({
      possible: false,
      reason: "The instance has to be stopped before loading a save",
      option: "stop",
    });
  }
  if (kind === "load" && thereIsLoadedSave) {
    blockers.push({
      possible: false,
      reason:
        "Would you like to backup the loaded save before loading the new one?",
      option: "backup",
    });
  }

  if (kind === "delete" && isLoadedSaveSelected && !isInstanceStopped) {
    blockers.push({
      possible: false,
      reason: "The instance has to be stopped before deleting the loaded save",
    });
  }

  //   if (kind === "clone" && isLoadedSaveSelected && !isInstanceStopped) {
  //     blockers.push({
  //       possible: false,
  //       reason: "The instance has to be stopped before cloning the loaded save",
  //       option: "stop",
  //     });
  //   }

  //   if (kind === "download" && isLoadedSaveSelected) {
  //     compress active world, send it to the client, delete the compressed file
  //   }

  if (blockers.length === 0) return { possible: true };
  return { possible: false, blockers };
}

export default Saves;
