import { Accessor, createSignal } from "solid-js";

type CacheSetter<T> = (newValue: T | ((p: T) => any)) => void;

export default function createCachedSignal<
  T extends boolean | number | string | Array<T> | Record<string, T>
>(initialValue: T, cacheKey: string): [Accessor<T>, CacheSetter<T>] {
  const key = `paper_webui_${cacheKey}`;
  const rawStoredValue = localStorage.getItem(key) as string | null;

  let parsedValue: T | null = null;
  if (rawStoredValue === null) {
    parsedValue = initialValue;
  } else if (rawStoredValue === "true" || rawStoredValue === "false") {
    //@ts-ignore
    parsedValue = rawStoredValue === "true" ? true : false;
  } else if (isNaN(rawStoredValue as any)) {
    parsedValue = Number(rawStoredValue) as T;
  } else {
    try {
      parsedValue = JSON.parse(rawStoredValue as string) as T;
    } catch (e) {
      console.error(e);
      parsedValue = null;
    }
  }

  const [getValue, setValue] = createSignal<T>(parsedValue ?? initialValue);

  const setter = (newValue: T | ((p: T) => T)) => {
    newValue = typeof newValue === "function" ? newValue(getValue()) : newValue;
    //@ts-ignore
    setValue(newValue);
    //@ts-ignore
    setCache(key, newValue);
  };

  return [getValue, setter];
}

function setCache(k: string, v: string) {
  localStorage.setItem(k, v);
}
