import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

export interface State {
  mcInstance: {
    status: "pending" | "on" | "off";
  };
}

const store = createStore<State>({
  mcInstance: {
    status: "pending"
  }
});

const McContext = createContext(store);

const useMcContext = () => useContext(McContext);

export { McContext, useMcContext };
