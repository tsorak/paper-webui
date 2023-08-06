import handleUpgrade from "./websocket-server/server.ts";
import webui from "./webui/server.ts";

export default function httpHandler(req: Request) {
  if (req.headers.get("upgrade") === "websocket") {
    return handleUpgrade(req);
  } else {
    return webui(req);
  }
}
