import { createContext, useContext } from "solid-js";
import { cacheStore, openStore } from "../utils/cachedStore";

interface SiteSettingsState {
  prompt: {
    delete: boolean;
  };
  views: {
    overview: {
      upperHeight: number;
    };
  };
}

const store = openStore<SiteSettingsState>({
  cacheKey: "site_settings",
  desiredVersion: 2,
  fallback: {
    prompt: {
      delete: true,
    },
    views: {
      overview: {
        upperHeight: 128,
      },
    },
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
  views: {
    overview: {
      upperHeight: (height: number) => {
        storeSetter("views", "overview", "upperHeight", height);
        updateCache();
      },
    },
  },
};

const SiteSettingsContext = createContext([storeGetter, mut] as [
  SiteSettingsState,
  typeof mut
]);

const useSiteSettingsContext = () => useContext(SiteSettingsContext);

export { SiteSettingsContext, useSiteSettingsContext };
