import { assertEquals } from "std_assert/mod.ts";
import { mapEntries } from "std_collections/mod.ts";

import type { SaveEntry } from "@/src/types.ts";
import SubscriptionMap from "@/src/utils/SubscriptionMap.ts";

type SavesStateInterface = Awaited<ReturnType<typeof buildSavesStateInterface>>;
let savesState: SavesStateInterface;
let savesStateRaw: SubscriptionMap<string, SaveEntry>;

function init() {
  initSavesState();
}

function initSavesState() {
  if (savesState) {
    return savesState;
  }

  savesStateRaw = new SubscriptionMap<string, SaveEntry>();

  buildSavesStateInterface(savesStateRaw);

  return savesState;
}

function buildSavesStateInterface(state: SubscriptionMap<string, SaveEntry>) {
  const stateInterface = {
    get: state.get.bind(state),
    set: (key: string, value: SaveEntry) => {
      const prev = state.get(key);
      if (!prev) {
        const nonNullishValue = ((): SaveEntry => {
          const entries = Object.entries(value);

          entries.forEach(([_, v], i) => {
            if (v === null || v === undefined) {
              entries.splice(i, 1);
            }
          });

          return Object.fromEntries(entries) as SaveEntry;
        })();

        state.set.bind(state)(key, nonNullishValue);
        return true;
      }

      // @ts-ignore: value is SaveEntry where all keys are strings.
      const nonNullishValue = mapEntries(value, ([k, v]) => {
        if (v === null || v === undefined) {
          return [k, prev[k as keyof SaveEntry]];
        } else {
          return [k, v];
        }
      }) as SaveEntry;

      // if equal to previous, return false.
      try {
        assertEquals(prev, nonNullishValue);
        return false;
      } catch (_) {
        //
      }

      state.set.bind(state)(key, value);
      return true;
    },
    has: state.has.bind(state),
    delete: state.delete.bind(state),
    getAll: () => [...state.values.bind(state)()] as SaveEntry[],
    subscribe: state.subscribe.bind(state),
    unsubscribe: state.unsubscribe.bind(state),
    update: (
      key: string,
      partialSaveEntry: Pick<SaveEntry, "jar" | "deleted">
    ) => {
      const prev = state.get(key);
      if (!prev) return false;

      const toBeSet = { ...prev, ...partialSaveEntry };
      try {
        assertEquals(prev, toBeSet);
        return false;
      } catch (_) {
        //
      }

      state.update.bind(state)(key, (entry) => {
        return { ...entry, ...partialSaveEntry };
      });
      return true;
    },
  };

  savesState = stateInterface;

  return stateInterface;
}

init();

export { init, savesState, savesStateRaw };
