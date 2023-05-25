import { Component } from "solid-js";
import Log from "../components/Log";

const Overview: Component = () => {
  return (
    <main class="flex flex-col gap-2 flex-grow backdrop:opacity-10 break-all">
      <OsResourceStats />
      <Log />
    </main>
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

export default Overview;
