import { createStore, unwrap, SetStoreFunction } from "solid-js/store";

function openStore<T extends object>(params: {
  cacheKey: string;
  fallback: T;
  desiredVersion: number;
}) {
  const { cacheKey, fallback, desiredVersion } = params;

  const cached: string | null = localStorage.getItem(
    `paper_webui_ctx_${cacheKey}`
  );

  const toStore = {
    ...fallback,
    _v: desiredVersion,
  };
  const createInitial = () => createStore<T>(toStore);

  if (!cached) {
    return createInitial();
  }

  const parsed = JSON.parse(cached);
  if (parsed?._v !== desiredVersion) {
    return createInitial();
  }

  return createStore<T>(parsed);
}

function cacheStore<T>(
  cacheKey: string,
  store: [get: T, set: SetStoreFunction<T>]
) {
  //
  const [data] = store;
  const rawState = unwrap(data);
  localStorage.setItem(`paper_webui_ctx_${cacheKey}`, JSON.stringify(rawState));
}

export { openStore, cacheStore };
