import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { InstanceStatusData } from "../websocket/message";

export interface State {
  mcInstance: {
    status: InstanceStatusData;
    stdout_lines: string[];
    players: string[];
  };
}

const store = createStore<State>({
  mcInstance: {
    status: "pending",
    stdout_lines: [],
    players: ["Notch", "jeb_", "Dinnerbone"],
  },
});

const McContext = createContext(store);

const useMcContext = () => useContext(McContext);

export { McContext, useMcContext };
