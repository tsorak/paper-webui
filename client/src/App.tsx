import { Component } from "solid-js";

import { McContext, useMcContext } from "./state";

import ServerStatus from "./components/ServerStatus";
import ViewsNav from "./components/ViewsNav";
import Log from "./components/Log";

const App: Component = () => {
  return (
    <McContext.Provider value={useMcContext()}>
      <div class="flex flex-col h-screen overflow-auto">
        <header>
          <h1 class="p-4 text-white bg-[#121225]">Paper WebUI</h1>
          <nav class="p-3 bg-blue-500 text-white leading-none">
            <div class="mx-auto flex max-w-6xl w-full justify-between">
              {/* left */}
              <div class="flex items-center">
                <p class="font-semibold">Home</p>
              </div>
              {/* right */}
              <div class="flex items-center">
                <ServerStatus />
              </div>
            </div>
          </nav>
        </header>
        <main class="flex-grow bg-gray-200">
          <div class="pt-4 w-full h-full max-w-6xl mx-auto">
            <div class="h-full flex gap-8">
              <div class="h-full w-44">
                <ViewsNav />
              </div>
              <div class="flex flex-col gap-2 flex-grow backdrop:opacity-10">
                <OsResourceStats />
                <Log />
              </div>
            </div>
          </div>
        </main>
        {/* <footer class="bg-gray-200">xd</footer> */}
      </div>
    </McContext.Provider>
  );
};

const OsResourceStats: Component = () => (
  <div class="os-resource-stats flex h-20 gap-4">
    <div class="bg-white flex-grow rounded-md" />
    <div class="bg-white flex-grow rounded-md" />
    <div class="bg-white flex-grow rounded-md" />
    <div class="bg-white flex-grow rounded-md" />
  </div>
);
export default App;
