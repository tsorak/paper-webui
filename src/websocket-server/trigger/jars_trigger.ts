import { clients } from "@/src/websocket-server/clients.ts";
import type { JarsChangeData } from "@/src/websocket/message.ts";
import { jarDirState } from "@/src/fs-watcher/jars-watcher.ts";

function emitJarsChange(data: JarsChangeData) {
  clients.forEach((client) => {
    client.ws.json({
      type: "jars_change",
      data,
    });
  });
}

jarDirState.subscribe("add", (jarName) => {
  emitJarsChange({ jarName, action: "add" });
});

jarDirState.subscribe("delete", (jarName) => {
  emitJarsChange({ jarName, action: "delete" });
});
