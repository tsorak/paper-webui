import { clients } from "@/src/websocket-server/clients.ts";
import type { SavesChangeData } from "@/src/websocket/message.ts";
import { saveDirState } from "@/src/fs-watcher/saves-watcher.ts";

export function emitSavesChange(data: SavesChangeData) {
  clients.forEach((client) => {
    client.ws.json({
      type: "saves_change",
      data,
    });
  });
}

saveDirState.subscribe("add", (savename) => {
  emitSavesChange({ savename, action: "add" });
});

saveDirState.subscribe("delete", (savename) => {
  emitSavesChange({ savename, action: "delete" });
});
