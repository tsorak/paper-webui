import { Component, Switch, Match } from "solid-js";

import { useViewContext } from "./context/viewContext";
import Overview from "./views/Overview";
import Versions from "./views/Versions";
import Saves from "./views/Saves";

const Router: Component = () => {
  const viewIs = (view: string) => useViewContext().view() === view;

  return (
    <>
      <Switch>
        <Match when={viewIs("overview")}>
          <Overview />
        </Match>
        <Match when={viewIs("saves")}>
          <Saves />
        </Match>
        <Match when={viewIs("logs")}>
          <div>Logs</div>
        </Match>
        <Match when={viewIs("versions")}>
          <Versions />
        </Match>
        <Match when={viewIs("settings")}>
          <div>Settings</div>
        </Match>
      </Switch>
    </>
  );
};

export default Router;
