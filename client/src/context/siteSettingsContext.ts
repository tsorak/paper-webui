import { createContext, useContext } from "solid-js";
import { cacheStore, openStore } from "../utils/cachedStore";

interface SiteSettingsState {
  prompt: {
    delete: boolean;
  };
}

const store = openStore<SiteSettingsState>("site_settings", {
  prompt: {
    delete: true,
  },
});
const [storeGetter, storeSetter] = store;

const updateCache = () => cacheStore("site_settings", store);
const mut = {
  prompt: {
    delete: () => {
      storeSetter("prompt", "delete", (p) => !p);
      updateCache();
    },
  },
};

const SiteSettingsContext = createContext([storeGetter, mut] as [
  SiteSettingsState,
  typeof mut
]);

const useSiteSettingsContext = () => useContext(SiteSettingsContext);

export { SiteSettingsContext, useSiteSettingsContext };
