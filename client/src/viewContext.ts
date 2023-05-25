import { createSignal, createContext, useContext } from "solid-js";

const [view, setView] = createSignal<string>(
  location.hash?.replace("#", "") ?? "overview"
);

const ViewContext = createContext({ view, setView });

const useViewContext = () => useContext(ViewContext);

export { ViewContext, useViewContext };
