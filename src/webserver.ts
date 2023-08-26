import handleUpgrade from "@/src/websocket-server/server.ts";
import webui from "@/src/webui/server.ts";

export default function httpHandler(req: Request) {
  if (req.headers.get("upgrade") === "websocket") {
    return handleUpgrade(req);
  } else {
    return webui(req);
  }
}
