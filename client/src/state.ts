import { createStore } from "solid-js/store";

interface State {
  mcInstance: {
    status: "pending" | "on" | "off";
  };
}

export const [state, setState] = createStore<State>({
  mcInstance: {
    status: "pending"
  }
});
