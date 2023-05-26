import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { InstanceStatusData } from "../../websocket/message";

export interface State {
  mcInstance: {
    status: InstanceStatusData;
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
