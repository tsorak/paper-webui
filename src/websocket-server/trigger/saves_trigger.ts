import { clients } from "@/src/websocket-server/clients.ts";
import type { SavesChangeData } from "@/src/websocket/message.ts";
import { savesState } from "@/src/globalState.ts";

export function emitSavesChange(data: SavesChangeData) {
  clients.forEach((client) => {
    client.ws.json({
      type: "saves_change",
      data,
    });
  });
}

savesState.subscribe("set", (save) => {
  emitSavesChange({ save, action: "set" });
});

savesState.subscribe("delete", (save) => {
  emitSavesChange({ save, action: "delete" });
});

savesState.subscribe("reset", (initialState) => {
  emitSavesChange({ initialState });
});
