import { Component } from "solid-js";

const ViewsNav: Component = () => (
  <div class="flex flex-col gap-1 bg-white rounded-md p-1 text-gray-500">
    <ViewLink text="Overview" href="/" />
    <ViewLink text="Settings" href="/settings" />
  </div>
);

const ViewLink: Component<{ text: string; href?: string }> = (p) => {
  const { text, href } = p;

  const at = href === window.location.pathname;

  return (
    <a
      class="w-full px-2 py-1 hover:bg-sky-100 hover:text-sky-600 transition-colors rounded-md"
      href={href || "#"}
      style={{ background: at && "#0284C72f", color: at && "#0284C7" }}
    >
      {text}
    </a>
  );
};

export default ViewsNav;
