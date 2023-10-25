import { Component } from "solid-js";
import { HopeProvider, NotificationsProvider } from "@hope-ui/solid";

import socket from "./websocket-client/socket";

import Router from "./Router";
import setupWindowListeners from "./windowListeners";

import { McContext, useMcContext } from "./context/mcContext";
import { ViewContext, useViewContext } from "./context/viewContext";

import ServerControls from "./components/ServerControls";
import ViewsNav from "./components/ViewsNav";
import {
  SiteSettingsContext,
  useSiteSettingsContext,
} from "./context/siteSettingsContext";

const App: Component = () => {
  setupWindowListeners(window);

  const { view } = useViewContext();

  const s = socket;
  s.connect();

  return (
    <HopeProvider>
      <NotificationsProvider placement={"top-start"}>
        <SiteSettingsContext.Provider value={useSiteSettingsContext()}>
          <McContext.Provider value={useMcContext()}>
            <ViewContext.Provider value={useViewContext()}>
              <div class="flex flex-col h-screen overflow-auto">
                <header>
                  <h1 class="p-4 text-white bg-[#121225]">Paper WebUI</h1>
                  <nav class="p-3 bg-blue-500 text-white leading-none">
                    <div class="mx-auto flex max-w-6xl w-full justify-between">
                      {/* left */}
                      <div class="flex items-center">
                        <p class="font-semibold">
                          Home {">"} {view()}
                        </p>
                      </div>
                      {/* right */}
                      <ServerControls />
                    </div>
                  </nav>
                </header>
                <div class="p-3 flex-grow bg-gray-200">
                  <div class="w-full h-full max-w-6xl mx-auto">
                    <div class="h-full flex gap-8">
                      <div class="h-full w-44 flex-shrink-0">
                        <ViewsNav />
                      </div>
                      <div class="flex flex-col gap-2 flex-grow backdrop:opacity-10 break-all">
                        <Router />
                      </div>
                    </div>
                  </div>
                </div>
                {/* <footer class="bg-gray-200">xd</footer> */}
              </div>
            </ViewContext.Provider>
          </McContext.Provider>
        </SiteSettingsContext.Provider>
      </NotificationsProvider>
    </HopeProvider>
  );
};

export default App;
