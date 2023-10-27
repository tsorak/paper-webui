import { Message } from "../../websocket/message";
import { useMcContext } from "../../context/mcContext";
import { CS } from "../socket";

export default function handleSavesChange(
  message: Message & { type: "saves_change" },
  _ws: CS
) {
  const [_, setMcContext] = useMcContext();

  if ("initialState" in message.data) {
    const saves = message.data.initialState.map(([_, s]) => s);

    setMcContext("saves", saves);
  } else if (message.data.action === "delete") {
    const [toDelete] = message.data.save;

    setMcContext("saves", (prev) => {
      const updated = prev.filter((p) => p.name !== toDelete);
      return updated;
    });
  } else if (message.data.action === "set") {
    const [_, toSet] = message.data.save;
    setMcContext("saves", (p) => {
      const lastAsMap = new Map(p.map((s) => [s.name, s]));
      lastAsMap.set(toSet.name, toSet);

      const updated = Array.from(lastAsMap.values());
      return updated;
    });
  }
}
