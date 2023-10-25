import { createStore, unwrap, SetStoreFunction } from "solid-js/store";

function openStore<T extends object>(cacheKey: string, fallback: T) {
  const cached: string | null = localStorage.getItem(
    `paper_webui_ctx_${cacheKey}`
  );

  if (!cached) {
    return createStore<T>(fallback);
  }

  return createStore<T>(JSON.parse(cached));
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
