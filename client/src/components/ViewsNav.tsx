import { Component, createSignal } from "solid-js";

const [view, setView] = createSignal<string>("overview");

const ViewsNav: Component = () => {
  return (
    <div class="flex flex-col gap-1 bg-white rounded-md p-1 text-gray-500">
      <ViewLink text="Overview" href="overview" />
      <ViewLink text="Logs" href="logs" />
      <ViewLink text="Settings" href="settings" />
    </div>
  );
};

const ViewLink: Component<{
  text: string;
  href?: string;
}> = (p) => {
  const { text, href } = p;
  const isCurrentLocation = () => view() === href;

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    if (isCurrentLocation()) return;
    setView(href);
    location.hash = href;
  }

  return (
    <button
      class="w-full px-2 py-1 hover:bg-sky-100 hover:text-sky-600 transition-colors rounded-md text-start"
      style={{
        background: isCurrentLocation() ? "#0284C72f" : null,
        color: isCurrentLocation() ? "#0284C7" : null
      }}
      onClick={handleClick}
    >
      {text}
    </button>
  );
};

export default ViewsNav;
