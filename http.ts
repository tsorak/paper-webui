import webui from "./webui.ts";

export default function httpHandler(req: Request) {
  if (req.headers.get("upgrade") === "websocket") {
    return handleWebSocket(req);
  } else {
    return webui(req);
  }
}

function handleWebSocket(req: Request) {
  const { response, socket } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    socket.send("Hello from Deno!");
  };
  return response;
}
