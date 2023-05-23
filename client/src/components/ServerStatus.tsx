import { state } from "../state";

export default function ServerStatus() {
  return (
    <div class="py-1 px-2 w-24 flex gap-2 rounded-md bg-white text-black">
      <StatusDot />
      <StatusText />
    </div>
  );
}

function StatusDot() {
  const status = () => state.mcInstance.status;

  const bg = (): string => {
    switch (status()) {
      case "pending":
        return "#ff0";
      case "on":
        return "#0f0";
      case "off":
        return "#f00";
      default:
        return "#555";
    }
  };

  const isStatus = (s: string): boolean => (status() === s ? true : false);

  return (
    <div
      class={
        "w-3 h-3 rounded-full leading-none self-center" +
        (isStatus("pending") ? " animate-ping" : "")
      }
      style={{ background: bg() }}
    />
  );
}

function StatusText() {
  const status = () => state.mcInstance.status;

  const text = (): string => {
    switch (status()) {
      case "pending":
        return "Pending";
      case "on":
        return "Online";
      case "off":
        return "Offline";
      default:
        return "error";
    }
  };

  return (
    <p class="self-center font-semibold opacity-70 mx-auto select-none">
      {text()}
    </p>
  );
}
