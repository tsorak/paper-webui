import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { InstanceStatusData } from "../websocket/message";

export interface SaveEntry {
  name: string;
  jar?: string;
  deleted?: boolean;
}

export interface State {
  mcInstance: {
    status: InstanceStatusData;
    stdout_lines: string[];
    players: string[];
  };
  jars: {
    installed: Set<string>;
    activeJar?: string;
  };
  saves: SaveEntry[];
}

const store = createStore<State>({
  mcInstance: {
    status: "pending",
    stdout_lines: [],
    players: ["Notch", "jeb_", "Dinnerbone"],
  },
  jars: {
    installed: new Set(),
    activeJar: undefined,
  },
  saves: [],
});

const McContext = createContext(store);

const useMcContext = () => useContext(McContext);

export { McContext, useMcContext };
